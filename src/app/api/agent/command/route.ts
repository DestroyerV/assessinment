import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
	const session = await getSession(request);
	if (!session)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	if (!process.env.GEMINI_API_KEY) {
		return NextResponse.json(
			{ error: "GEMINI_API_KEY is not configured on the server." },
			{ status: 500 },
		);
	}

	try {
		const { command } = await request.json();

		if (!command) {
			return NextResponse.json(
				{ error: "Command is required" },
				{ status: 400 },
			);
		}

		const roles = await prisma.role.findMany({ select: { name: true } });
		const permissions = await prisma.permission.findMany({
			select: { name: true },
		});

		const roleNames = roles.map((r) => r.name).join(", ");
		const permNames = permissions.map((p) => p.name).join(", ");

		const prompt = `
      You are an RBAC (Role-Based Access Control) administrator assistant.
      Your job is to interpret natural language commands and output a JSON array of actions to execute.

      Current Roles: [${roleNames}]
      Current Permissions: [${permNames}]

      Supported Actions:
      1. CREATE_ROLE: { "type": "CREATE_ROLE", "name": "...", "description": "..." }
      2. CREATE_PERMISSION: { "type": "CREATE_PERMISSION", "name": "...", "description": "..." } // name should be key-like e.g. posts:edit
      3. ASSIGN_PERMISSION: { "type": "ASSIGN_PERMISSION", "role": "...", "permission": "..." } // use exact names if they exist, or they will be created
      
      Rules:
      - If a role or permission already exists, do not try to create it again, just use it for assignment.
      - If the user asks to assign a permission that doesn't exist, create it first.
      - Output ONLY valid JSON.

      Command: "${command}"
    `;

		const result = await genAI.models.generateContent({
			model: "gemini-3-flash-preview",
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		});

		const text = result.text;

		if (!text) {
			throw new Error("No response text from Gemini");
		}

		const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();

		let actions;
		try {
			actions = JSON.parse(jsonStr);
		} catch (e) {
			console.error("Failed to parse LLM response", text);
			return NextResponse.json(
				{ error: "Failed to interpret command" },
				{ status: 400 },
			);
		}

		if (!Array.isArray(actions)) {
			return NextResponse.json(
				{ error: "Invalid response format from agent" },
				{ status: 500 },
			);
		}

		const results = [];

		for (const action of actions) {
			try {
				if (action.type === "CREATE_ROLE") {
					const exist = await prisma.role.findUnique({
						where: { name: action.name },
					});
					if (!exist) {
						const r = await prisma.role.create({
							data: { name: action.name, description: action.description },
						});
						results.push(`Created role '${r.name}'`);
					} else {
						results.push(`Role '${action.name}' already exists`);
					}
				} else if (action.type === "CREATE_PERMISSION") {
					const exist = await prisma.permission.findUnique({
						where: { name: action.name },
					});
					if (!exist) {
						const p = await prisma.permission.create({
							data: { name: action.name, description: action.description },
						});
						results.push(`Created permission '${p.name}'`);
					} else {
						results.push(`Permission '${action.name}' already exists`);
					}
				} else if (action.type === "ASSIGN_PERMISSION") {
					const role = await prisma.role.findUnique({
						where: { name: action.role },
					});
					let permission = await prisma.permission.findUnique({
						where: { name: action.permission },
					});

					if (!role) {
						results.push(`Failed to assign: Role '${action.role}' not found`);
						continue;
					}
					if (!permission) {
						permission = await prisma.permission.create({
							data: {
								name: action.permission,
								description: "Auto-created by agent",
							},
						});
						results.push(`Auto-created permission '${permission.name}'`);
					}

					const exists = await prisma.rolePermission.findUnique({
						where: {
							role_id_permission_id: {
								role_id: role.id,
								permission_id: permission.id,
							},
						},
					});

					if (!exists) {
						await prisma.rolePermission.create({
							data: { role_id: role.id, permission_id: permission.id },
						});
						results.push(`Assigned '${permission.name}' to '${role.name}'`);
					} else {
						results.push(
							`'${permission.name}' is already assigned to '${role.name}'`,
						);
					}
				}
			} catch (err: any) {
				results.push(`Error executing ${action.type}: ${err.message}`);
			}
		}

		return NextResponse.json({ success: true, results });
	} catch (error) {
		console.error("Agent error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
