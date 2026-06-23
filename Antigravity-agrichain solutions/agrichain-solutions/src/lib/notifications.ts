import { prisma } from '@/lib/prisma';

/**
 * NOTIFICATION SERVICE
 * Manages the delivery and state of user notifications.
 */
export async function sendNotification(userId: string, { title, message, type, priority = 'medium' }) {
  console.log(`[NotificationService] Sending ${type} notification to ${userId}: ${title}`);
  
  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      priority,
    },
  });
}

/**
 * BENEFIT MANAGEMENT SERVICE
 * Handles temporary and permanent advantages (Discounts, Priority, etc.)
 */
export async function grantBenefit(userId: string, { title, description, type, isPermanent = false, durationDays = 7, value = 0 }) {
  const expiresAt = isPermanent ? null : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
  
  const benefit = await prisma.benefit.create({
    data: {
      userId,
      title,
      description,
      type,
      isPermanent,
      expiresAt,
      value,
    },
  });

  // Notify user about the new benefit
  await sendNotification(userId, {
    title: isPermanent ? "Nouveau Privilège Permanent !" : "Boost Temporaire Activé !",
    message: `${title}: ${description}`,
    type: "REWARD",
    priority: "high",
  });

  return benefit;
}

/**
 * ECOSYSTEM SYNERGY ENGINE
 * Rewards for non-producer actors (Logistics, Industry, etc.)
 */
export async function processEcosystemReward(userId: string, role: string, action: string) {
  let tokens = 0;
  let reason = "";

  switch (role) {
    case 'logistics':
      if (action === 'GREEN_DELIVERY') { tokens = 30; reason = "Livraison à faible émission carbone"; }
      if (action === 'ON_TIME_SREAK') { tokens = 20; reason = "Série de livraisons ponctuelles"; }
      break;
    case 'industry':
      if (action === 'FAIR_TRADE_BUY') { tokens = 50; reason = "Achat équitable certifié"; }
      if (action === 'ECO_PACKAGING') { tokens = 40; reason = "Utilisation d'emballages biodégradables"; }
      break;
    case 'cooperative':
      if (action === 'MEMBER_SUPPORT') { tokens = 100; reason = "Soutien actif aux petits producteurs"; }
      break;
  }

  if (tokens > 0) {
    // reuse tokenomics service
    await prisma.user.update({
      where: { id: userId },
      data: { agriTokenBalance: { increment: tokens } },
    });
    
    await sendNotification(userId, {
      title: "Récompense Écosystème !",
      message: `Vous avez gagné ${tokens} $AGRI pour ${reason}`,
      type: "REWARD",
    });
  }
}
