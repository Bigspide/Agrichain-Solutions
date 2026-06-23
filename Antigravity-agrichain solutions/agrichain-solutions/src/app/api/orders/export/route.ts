import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 0;
  const limit = Number(searchParams.get('limit')) || 100;

  const orders = await prisma.order.findMany({
    skip: page * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const csvHeader = 'ID,User,Total,Status,CreatedAt\n';
  const csvRows = orders
    .map(o => `${o.id},${o.buyerId},${o.totalAmount},${o.status},${o.createdAt.toISOString()}`)
    .join('\n');

  const csv = csvHeader + csvRows;

  const headers = {
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename=orders.csv',
  };

  return new NextResponse(csv, { headers });
}
