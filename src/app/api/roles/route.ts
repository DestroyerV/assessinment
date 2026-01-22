import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/roles - List all roles
export async function GET(request: Request) {
	const session = await getSession(request);
	if (!session)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const roles = await prisma.role.findMany({
			orderBy: { created_at: "desc" },
			include: {
				role_permissions: true,
				_count: {
					select: { role_permissions: true, user_roles: true },
				},
			},
		});
		return NextResponse.json(roles);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch roles" },
			{ status: 500 },
		);
	}
}

// POST /api/roles - Create a new role
export async function POST(request: Request) {
	const session = await getSession(request);
	if (!session)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const { name, description } = await request.json();

		if (!name) {
			return NextResponse.json(
				{ error: "Role name is required" },
				{ status: 400 },
			);
		}

		const role = await prisma.role.create({
			data: { name, description },
		});

		return NextResponse.json(role);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to create role" },
			{ status: 500 },
		);
	}
}
