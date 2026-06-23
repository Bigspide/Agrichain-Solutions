import { prisma } from '@/lib/prisma';

/**
 * AgriToken Reward System (Proof-of-Contribution)
 */
export async function awardAgriTokens(userId: string, amount: number, reason: string) {
  console.log(`[TokenEngine] Awarding ${amount} $AGRI to user ${userId} for: ${reason}`);
  
  return await prisma.user.update({
    where: { id: userId },
    data: {
      agriTokenBalance: {
        increment: amount,
      },
    },
  });
}

/**
 * Action-to-Token Mapping
 */
export const TOKEN_REWARDS = {
  COURSE_COMPLETED: 10,
  SUSTAINABLE_PRACTICE: 25,
  TRACEABILITY_VALIDATED: 5,
  COMMUNITY_HELP: 15,
  DAILY_LOGIN: 1,
};

/**
 * Parametric Insurance Engine
 */
export async function checkInsuranceTriggers(weatherData: { 
  location: string; 
  rainfall: number; 
  windSpeed: number; 
}) {
  console.log(`[InsuranceEngine] Checking triggers for ${weatherData.location}...`);
  
  const activePolicies = await prisma.insurancePolicy.findMany({
    where: { 
      status: 'active',
      // In production, we would match location coordinates
    },
  });

  const payouts = [];

  for (const policy of activePolicies) {
    let triggered = false;
    
    if (policy.triggerType === 'rainfall_low' && weatherData.rainfall < policy.triggerValue) {
      triggered = true;
    } else if (policy.triggerType === 'wind_high' && weatherData.windSpeed > policy.triggerValue) {
      triggered = true;
    }

    if (triggered) {
      // Automatic payout via Wallet
      await prisma.walletTransaction.create({
        data: {
          userId: policy.userId,
          type: 'credit',
          amount: policy.coverageAmount,
          currency: 'XOF',
          description: `Insurance payout: ${policy.triggerType} detected`,
          category: 'insurance',
          reference: `INS-PAY-${Date.now()}`,
          status: 'completed',
        },
      });

      await prisma.insurancePolicy.update({
        where: { id: policy.id },
        data: { status: 'claimed' },
      });

      payouts.push({ policyId: policy.id, userId: policy.userId });
    }
  }

  return payouts;
}
