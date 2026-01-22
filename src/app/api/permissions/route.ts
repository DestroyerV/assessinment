import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/permissions
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(permissions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
  }
}

// POST /api/permissions
export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Permission name is required' }, { status: 400 });
    }

    const permission = await prisma.permission.create({
      data: { name, description },
    });

    return NextResponse.json(permission);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create permission' }, { status: 500 });
  }
}
