import { prisma } from '@/lib/prisma';

export async function submitRequest(userId: string, title: string, description: string, priority: string = 'medium') {
  return await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: 'USER_REQUEST',
      entity: 'PLATFORM_IMPROVEMENT',
      metadata: {
        title,
        description,
        priority,
        status: 'open',
      },
    },
  });
}

export async function getAdminRequests() {
  return await prisma.auditLog.findMany({
    where: { action: 'USER_REQUEST' },
    orderBy: { createdAt: 'desc' },
  });
}
