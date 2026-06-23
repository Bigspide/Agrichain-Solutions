import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { processPayment } from '@/lib/payment';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, amount, orderId } = await request.json();

    if (!phone || !amount || !orderId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Validate order and update amount
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: amount },
    });

    // Process payment using the professional strategy
    const result = await processPayment('mobile_money', {
      amount,
      currency: 'XOF',
      orderId: order.id,
      userId: user.id,
      metadata: { phone },
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      paymentRef: result.paymentId, 
      status: 'pending',
      message: 'Transaction initiated via Mobile Money'
    });
  } catch (error: any) {
    console.error('[Checkout] Mobile Money Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
