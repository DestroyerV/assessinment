import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// POST /api/roles/[id]/permissions
// Assign a permission to a role
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const { permissionId } = await request.json();

    if (!permissionId) {
      return NextResponse.json({ error: 'Permission ID is required' }, { status: 400 });
    }

    const assignment = await prisma.rolePermission.create({
      data: {
        role_id: id,
        permission_id: permissionId,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign permission' }, { status: 500 });
  }
}
