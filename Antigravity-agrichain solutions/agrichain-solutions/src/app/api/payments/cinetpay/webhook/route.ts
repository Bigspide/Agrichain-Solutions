import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { anchorToBlockchain } from '@/lib/blockchain-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // CinetPay sends a notification when the payment status changes
    // Typical payload: { transaction_id: "...", status: "ACCEPTED/FAILED", amount: 100, ... }
    const { transaction_id, status, amount, currency } = body;

    if (!transaction_id) {
      return NextResponse.json({ error: 'Missing transaction_id' }, { status: 400 });
    }

    logger.info(`[CinetPay-Webhook] Received notification for ${transaction_id}: ${status}`);

    // 1. Update the Wallet Transaction
    const transaction = await prisma.walletTransaction.findUnique({
      where: { reference: transaction_id },
    });

    if (!transaction) {
      logger.error(`[CinetPay-Webhook] Transaction ${transaction_id} not found in DB`);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (status === 'ACCEPTED') {
      // Mark transaction as completed
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: 'completed' },
      });

      // 2. Update the related Order status
      // We extract the orderId from the transaction reference (e.g., AGRI-123456-orderId)
      const orderId = transaction_id.split('-').pop();
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            paymentStatus: 'completed',
            status: 'paid' 
          },
        });
      }

      // 3. Anchor the successful payment to the Blockchain for absolute transparency
      try {
        await anchorToBlockchain(`payment_confirmed:${transaction_id}`, `PAY-${orderId}`);
        logger.info(`[CinetPay-Webhook] Payment ${transaction_id} anchored to blockchain.`);
      } catch (e) {
        logger.error(`[CinetPay-Webhook] Blockchain anchoring failed: ${e}`);
      }

      logger.info(`[CinetPay-Webhook] Transaction ${transaction_id} successfully processed.`);
    } else if (status === 'FAILED') {
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: 'failed' },
      });
      logger.warn(`[CinetPay-Webhook] Transaction ${transaction_id} marked as failed.`);
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error: any) {
    logger.error(`[CinetPay-Webhook] Error processing webhook: ${error.message}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
