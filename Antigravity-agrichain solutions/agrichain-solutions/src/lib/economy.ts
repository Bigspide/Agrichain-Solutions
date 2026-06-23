import { prisma } from '@/lib/prisma';

/**
 * CONFIGURATION DES COMMISSIONS
 */
export const COMMISSION_CONFIG = {
  baseRate: 0.03, // 3% par défaut
  tiers: {
    producer: 0.03,
    cooperative: 0.02,
    industry: 0.05,
    consumer: 0,
  },
  prestigeLevels: {
    bronze: 1,    // 100% de la commission
    silver: 0.9,  // 10% de réduction
    gold: 0.8,    // 20% de réduction
    platinum: 0.7, // 30% de réduction
  }
};

/**
 * SERVICE DE GESTION DES COMMISSIONS
 */
export async function calculateTransactionFees(userId: string, amount: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  // 1. Base rate selon le rôle
  const roleRate = COMMISSION_CONFIG.tiers[user.role as keyof typeof COMMISSION_CONFIG.tiers] || COMMISSION_CONFIG.baseRate;
  
  // 2. Ajustement selon le niveau de prestige (calculé via tokens)
  let prestigeMultiplier = 1;
  if (user.agriTokenBalance > 10000) prestigeMultiplier = COMMISSION_CONFIG.prestigeLevels.platinum;
  else if (user.agriTokenBalance > 5000) prestigeMultiplier = COMMISSION_CONFIG.prestigeLevels.gold;
  else if (user.agriTokenBalance > 1000) prestigeMultiplier = COMMISSION_CONFIG.prestigeLevels.silver;

  const finalFee = amount * roleRate * prestigeMultiplier;
  const sellerAmount = amount - finalFee;

  return {
    totalAmount: amount,
    platformFee: finalFee,
    sellerNet: sellerAmount,
    rate: roleRate * prestigeMultiplier,
  };
}

/**
 * MOTEUR DE RÉCOMPENSES ÉVOLUÉ (Gamification)
 */
export const REWARD_ACTIONS = {
  SUSTAINABLE_PRACTICE: { tokens: 50, xp: 100 },
  COURSE_COMPLETED: { tokens: 20, xp: 50 },
  MENTORING_SESS: { tokens: 100, xp: 200 },
  TRACEABILITY_VERIFIED: { tokens: 10, xp: 20 },
  DAILY_STREAK: { tokens: 2, xp: 10 },
};

export async function processUserReward(userId: string, action: keyof typeof REWARD_ACTIONS) {
  const reward = REWARD_ACTIONS[action];
  
  return await prisma.user.update({
    where: { id: userId },
    data: {
      agriTokenBalance: { increment: reward.tokens },
      // On pourrait ajouter un champ 'experience' au User pour gérer les niveaux
    },
  });
}

/**
 * LOGIQUE D'ESCROW (Séquestre)
 */
export async function createEscrowPayment(orderId: string, amount: number, buyerId: string, sellerId: string) {
  // On crée une transaction en statut 'held' (bloquée)
  return await prisma.walletTransaction.create({
    data: {
      userId: buyerId,
      type: 'debit',
      amount: amount,
      currency: 'XOF',
      description: `Payment held in Escrow for Order ${orderId}`,
      category: 'escrow',
      reference: `ESCROW-${orderId}`,
      status: 'pending',
    },
  });
}

export async function releaseEscrowPayment(orderId: string) {
  const escrow = await prisma.walletTransaction.findFirst({
    where: { reference: `ESCROW-${orderId}` },
  });

  if (!escrow) throw new Error("Escrow transaction not found");

  // 1. Calcul des commissions
  const seller = await prisma.user.findUnique({ 
    where: { id: escrow.userId } // Simplification, devrait être le seller de l'order
  });
  
  // Note: En production, on récupère le seller de la commande
  // const { platformFee, sellerNet } = await calculateTransactionFees(seller.id, escrow.amount);

  // 2. Versement au vendeur
  await prisma.walletTransaction.create({
    data: {
      userId: "seller_id_here", 
      type: 'credit',
      amount: escrow.amount, // Moins la commission
      currency: 'XOF',
      description: `Funds released from Escrow for Order ${orderId}`,
      category: 'sale',
      reference: `RELEASE-${orderId}`,
      status: 'completed',
    },
  });

  // 3. Marquage de l'escrow comme terminé
  await prisma.walletTransaction.update({
    where: { id: escrow.id },
    data: { status: 'completed' },
  });
}
