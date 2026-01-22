import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// DELETE /api/roles/[id]/permissions/[permissionId]
// Remove a permission from a role
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; permissionId: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, permissionId } = await params;

  try {
    await prisma.rolePermission.delete({
      where: {
        role_id_permission_id: {
          role_id: id,
          permission_id: permissionId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove permission' }, { status: 500 });
  }
}
