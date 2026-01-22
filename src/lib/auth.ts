import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

export async function comparePassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string }): string {
	return jwt.sign(payload, JWT_SECRET!, { expiresIn: "1d" });
}

export async function getSession(request: Request) {
	const cookieHeader = request.headers.get("cookie");
	if (!cookieHeader) return null;

	const token = cookieHeader
		.split(";")
		.find((c) => c.trim().startsWith("token="))
		?.split("=")[1];

	if (!token) return null;

	const decoded = jwt.verify(token, JWT_SECRET!) as { userId: string };
	if (!decoded || !decoded.userId) return null;

	const user = await prisma.user.findUnique({
		where: { id: decoded.userId },
		select: { id: true, email: true, user_roles: { include: { role: true } } },
	});

	return user;
}

export async function getCurrentUser() {
	const { cookies } = await import("next/headers");
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) return null;

	// Ensure JWT_SECRET is defined before verifying
	if (!JWT_SECRET) return null;

	try {
		const decoded = jwt.verify(token, JWT_SECRET!) as { userId: string };
		if (!decoded || !decoded.userId) return null;

		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: {
				id: true,
				email: true,
				user_roles: { include: { role: true } },
			},
		});

		return user;
	} catch (error) {
		return null;
	}
}
