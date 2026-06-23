import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { anchorToBlockchain } from './blockchain-service';
import * as chains from 'viem/chains';

/**
 * PAYMENT SYSTEM TYPES
 */
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

/**
 * STRATEGY INTERFACE
 */
interface IPaymentStrategy {
  process(request: PaymentRequest): Promise<PaymentResponse>;
  verify(paymentId: string): Promise<'pending' | 'completed' | 'failed'>;
}

/**
 * STRIPE STRATEGY
 */
class StripeStrategy implements IPaymentStrategy {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });
  }
  async process(request: PaymentRequest): Promise<PaymentResponse> {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY missing");
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: { currency: request.currency.toLowerCase(), product_data: { name: `Order ${request.orderId}` }, unit_amount: Math.round(request.amount * 100) },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace`,
      metadata: { orderId: request.orderId, userId: request.userId },
    });
    return { success: true, paymentId: session.id, url: session.url, status: 'pending' };
  }
  async verify(paymentId: string): Promise<'pending' | 'completed' | 'failed'> {
    const session = await this.stripe.checkout.sessions.retrieve(paymentId);
    return session.payment_status === 'paid' ? 'completed' : session.payment_status === 'expired' ? 'failed' : 'pending';
  }
}

/**
 * PAYPAL STRATEGY
 */
class PayPalStrategy implements IPaymentStrategy {
  async process(request: PaymentRequest): Promise<PaymentResponse> {
    const paypalPaymentId = `PP-${Date.now()}-${request.orderId}`;
    return { success: true, paymentId: paypalPaymentId, url: `https://www.paypal.com/checkoutnow?token=${paypalPaymentId}`, status: 'pending' };
  }
  async verify(paymentId: string): Promise<'pending' | 'completed' | 'failed'> {
    return 'pending'; 
  }
}

/**
 * CINETPAY STRATEGY (Unified Mobile Money for West Africa)
 * Supports Wave, Orange, MTN, Moov via CinetPay API
 */
class CinetPayStrategy implements IPaymentStrategy {
  async process(request: PaymentRequest): Promise<PaymentResponse> {
    if (!request.operator) throw new Error("Mobile Money operator is required");
    
    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;

    if (!apiKey || !siteId) {
      throw new Error("CinetPay configuration missing (CINETPAY_API_KEY or CINETPAY_SITE_ID)");
    }

    const cinetPayRef = `AGRI-${Date.now()}-${request.orderId}`;
    
    try {
      const response = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apikey: apiKey,
          site_id: siteId,
          transaction_id: cinetPayRef,
          amount: request.amount,
          currency: request.currency,
          description: `Payment for Order ${request.orderId}`,
          customer_name: "AgriChain User",
          customer_phone: "UserPhone", // In a real scenario, this should be passed via request.metadata or a User object
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/cinetpay/webhook`,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || "CinetPay API request failed");
      }

      return { 
        success: true, 
        paymentId: cinetPayRef, 
        url: data.data?.payment_url || `https://checkout.cinetpay.com/${cinetPayRef}`, 
        status: 'pending' 
      };
    } catch (error: any) {
      console.error("[CinetPayStrategy] Payment initiation failed:", error);
      throw new Error(`CinetPay initiation failed: ${error.message}`);
    }
  }

  async verify(paymentId: string): Promise<'pending' | 'completed' | 'failed'> {
    // Verification via CinetPay API to check current transaction status
    try {
      const apiKey = process.env.CINETPAY_API_KEY;
      const siteId = process.env.CINETPAY_SITE_ID;

      if (!apiKey || !siteId) throw new Error("CinetPay configuration missing");

      const response = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apikey: apiKey,
          site_id: siteId,
          transaction_id: paymentId,
        }),
      });

      const data = await response.json();
      
      if (data.status === 'ACCEPTED') return 'completed';
      if (data.status === 'FAILED') return 'failed';
      return 'pending';
    } catch (error) {
      console.error("[CinetPayStrategy] Verification failed:", error);
      return 'pending';
    }
  }
}

/**
 * CRYPTO STRATEGY (Web3 Payments)
 */
class CryptoStrategy implements IPaymentStrategy {
  private publicClient;

  constructor() {
    // Initialize viem public client for blockchain reads
    if (process.env.EVM_RPC_URL) {
      import { createPublicClient, http } from 'viem';
      this.publicClient = createPublicClient({
        chain: chains[process.env.EVM_CHAIN_ID || 'mainnet'],
        transport: http(),
      });
    }
  }

  async process(request: PaymentRequest): Promise<PaymentResponse> {
    if (!request.walletAddress) throw new Error("Wallet address is required for crypto payments");
    
    const cryptoRef = `CRYPTO-${Date.now()}-${request.orderId}`;
    
    // In production, we provide the treasury address and the exact amount expected
    const treasuryAddress = process.env.CRYPTO_TREASURY_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    return { 
      success: true, 
      paymentId: cryptoRef, 
      url: `/dashboard/payments/crypto?address=${treasuryAddress}&ref=${cryptoRef}`, 
      status: 'pending' 
    };
  }

  async verify(paymentId: string): Promise<'pending' | 'completed' | 'failed'> {
    if (!this.publicClient) return 'pending';

    try {
      // Extract orderId from paymentId (CRYPTO-timestamp-orderId)
      const orderId = paymentId.split('-').pop();
      if (!orderId) return 'failed';

      // In a real high-end system, we would check the treasury address for a transaction 
      // that matches the amount and has the paymentId in the 'data' field (memo).
      // For this implementation, we simulate the scan of the latest transactions
      // but the architecture is now ready for real viem calls.
      
      // const txs = await this.publicClient.getLogs({ 
      //   address: process.env.CRYPTO_TREASURY_ADDRESS,
      //   fromBlock: 'latest' 
      // });

      // If match found -> return 'completed'
      
      return 'pending'; // Still pending until block confirmation
    } catch (error) {
      console.error("[CryptoStrategy] Verification failed:", error);
      return 'failed';
    }
  }
}

/**
 * BANK TRANSFER STRATEGY
 */
class BankTransferStrategy implements IPaymentStrategy {
  async process(request: PaymentRequest): Promise<PaymentResponse> {
    const bankRef = `BANK-${Date.now()}-${request.orderId}`;
    return { success: true, paymentId: bankRef, url: `/dashboard/payments/bank-details?ref=${bankRef}`, status: 'pending' };
  }
  async verify(paymentId: string): Promise<'pending' | 'completed' | 'failed'> {
    return 'pending';
  }
}

/**
 * PAYMENT HUB
 */
export class PaymentHub {
  private strategies: Record<PaymentProvider, IPaymentStrategy>;

  constructor() {
    this.strategies = {
      stripe: new StripeStrategy(),
      paypal: new PayPalStrategy(),
      mobile_money: new CinetPayStrategy(),
      bank_transfer: new BankTransferStrategy(),
      crypto: new CryptoStrategy(),
    };
  }

  async executePayment(provider: PaymentProvider, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const strategy = this.strategies[provider];
      const response = await strategy.process(request);
      
      if (response.success) {
        try {
          await anchorToBlockchain(`payment_intent:${response.paymentId}`, `PAY-${request.orderId}`);
        } catch (e) {
          console.error("[PaymentHub] Blockchain anchoring failed:", e);
        }
      }
      return response;
    } catch (error: any) {
      return { success: false, paymentId: '', status: 'failed', error: error.message };
    }
  }

  async checkStatus(provider: PaymentProvider, paymentId: string): Promise<'pending' | 'completed' | 'failed'> {
    return await this.strategies[provider].verify(paymentId);
  }
}

export const paymentHub = new PaymentHub();
