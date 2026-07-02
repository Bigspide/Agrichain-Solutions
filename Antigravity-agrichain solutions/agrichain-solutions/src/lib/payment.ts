import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { anchorToBlockchain } from './blockchain-service';
import * as chains from 'viem/chains';
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';

/** PAYMENT SYSTEM TYPES */
export type PaymentProvider = 'stripe' | 'paypal' | 'mobile_money' | 'bank_transfer' | 'crypto';
export type MobileMoneyOperator = 'wave' | 'orange' | 'mtn' | 'moov';

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  userId: string;
  operator?: MobileMoneyOperator;
  walletAddress?: string; // Required for crypto
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  url?: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

/** STRATEGY INTERFACE */
interface IPaymentStrategy {
  process(request: PaymentRequest): Promise<PaymentResponse>;
  verify(paymentId: string): Promise<'pending' | 'completed' | 'failed'>;
}

/** STRIPE STRATEGY */
class StripeStrategy implements IPaymentStrategy {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });
  }
  async process(request: PaymentRequest): Promise<PaymentResponse> {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY missing');
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: request.currency.toLowerCase(),
          product_data: { name: `Order ${request.orderId}` },
          unit_amount: Math.round(request.amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace`,
      metadata: { orderId: request.orderId, userId: request.userId },
    });
    return { success: true, paymentId: session.id, url: session.url, status: 'pending' };
  }
  async verify(paymentId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(paymentId);
    return session.payment_status === 'paid' ? 'completed' : session.payment_status === 'expired' ? 'failed' : 'pending';
  }
}

/** PAYPAL STRATEGY */
class PayPalStrategy implements IPaymentStrategy {
  private client: paypal.core.PayPalHttpClient;
  constructor() {
    const env = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID || '',
      process.env.PAYPAL_CLIENT_SECRET || ''
    );
    this.client = new paypal.core.PayPalHttpClient(env);
  }
  async process(request: PaymentRequest): Promise<PaymentResponse> {
    const order = new paypal.orders.OrdersCreateRequest();
    order.prefer('return=representation');
    order.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: request.currency, value: request.amount.toString() } }],
    });
    const res = await this.client.execute(order);
    logger.info('[Payment] PayPal order created', { id: res.result.id });
    return { success: true, paymentId: res.result.id, url: `https://www.paypal.com/checkoutnow?token=${res.result.id}`, status: 'pending' };
  }
  async verify(paymentId: string) {
    const request = new paypal.orders.OrdersGetRequest(paymentId);
    const res = await this.client.execute(request);
    const status = res.result.status;
    return status === 'COMPLETED' ? 'completed' : status === 'FAILED' ? 'failed' : 'pending';
  }
}

/** CINETPAY STRATEGY (Mobile Money) */
class CinetPayStrategy implements IPaymentStrategy {
  async process(request: PaymentRequest): Promise<PaymentResponse> {
    if (!request.operator) throw new Error('Mobile Money operator is required');
    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;
    if (!apiKey || !siteId) throw new Error('CinetPay configuration missing');
    const ref = `AGRI-${Date.now()}-${request.orderId}`;
    const payload = {
      apikey: apiKey,
      site_id: siteId,
      transaction_id: ref,
      amount: request.amount,
      currency: request.currency,
      description: `Payment for Order ${request.orderId}`,
      customer_name: 'AgriChain User',
      customer_phone: request.metadata?.phone || '0000000000',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/cinetpay/webhook`,
    };
    const resp = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok || data.error) throw new Error(data.error?.message || 'CinetPay request failed');
    return { success: true, paymentId: ref, url: data.data?.payment_url, status: 'pending' };
  }
  async verify(paymentId: string) {
    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;
    if (!apiKey || !siteId) throw new Error('CinetPay configuration missing');
    const resp = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apikey: apiKey, site_id: siteId, transaction_id: paymentId }),
    });
    const data = await resp.json();
    if (data.status === 'ACCEPTED') return 'completed';
    if (data.status === 'FAILED') return 'failed';
    return 'pending';
  }
}

/** CRYPTO STRATEGY */
class CryptoStrategy implements IPaymentStrategy {
  private client;
  constructor() {
    if (process.env.EVM_RPC_URL) {
      const { createPublicClient, http } = require('viem');
      this.client = createPublicClient({
        chain: chains[process.env.EVM_CHAIN_ID || 'mainnet'],
        transport: http(),
      });
    }
  }
  async process(request: PaymentRequest): Promise<PaymentResponse> {
    if (!request.walletAddress) throw new Error('Wallet address required for crypto');
    const ref = `CRYPTO-${Date.now()}-${request.orderId}`;
    const treasury = process.env.CRYPTO_TREASURY_ADDRESS || '0x0000000000000000000000000000000000000000';
    return { success: true, paymentId: ref, url: `/dashboard/payments/crypto?address=${treasury}&ref=${ref}`, status: 'pending' };
  }
  async verify(paymentId: string) {
    if (!this.client) return 'pending';
    // Implementation depends on blockchain; placeholder returns pending
    return 'pending';
  }
}

/** PAYMENT SERVICE FACTORY */
export const paymentService = {
  getStrategy(provider: PaymentProvider): IPaymentStrategy {
    switch (provider) {
      case 'stripe': return new StripeStrategy();
      case 'paypal': return new PayPalStrategy();
      case 'mobile_money': return new CinetPayStrategy();
      case 'crypto': return new CryptoStrategy();
      default: throw new Error(`Unsupported payment provider: ${provider}`);
    }
  },
};
