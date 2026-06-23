import { prisma } from '@/lib/prisma';
import { paymentHub } from '@/lib/payment';

/**
 * AI Tool Definitions
 * These functions can be called by the AI to perform real actions on the platform.
 */
export const aiTools = {
  // 1. Marketplace Action: Create a Product
  createProduct: async ({ name, price, quantity, unit, description, category }: any) => {
    const user = await prisma.user.findFirst({ where: { role: { not: 'consumer' } } }); // Simplified for demo, should use session
    if (!user) throw new Error("You must be a producer or cooperative to sell products.");

    const product = await prisma.product.create({
      data: {
        name, price, quantity, unit, description, category,
        sellerId: user.id,
        images: [],
        certifications: [],
        origin: "West Africa",
        currency: "XOF",
      },
    });
    return { success: true, productId: product.id, message: `Product ${name} created successfully!` };
  },

  // 2. Finance Action: Check Wallet Balance
  getWalletBalance: async ({ userId }: { userId: string }) => {
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
    });
    const balance = transactions.reduce((acc, tx) => tx.type === 'credit' ? acc + tx.amount : acc - tx.amount, 0);
    return { balance, currency: "XOF" };
  },

  // 3. Logistics Action: Start a Shipment
  startShipment: async ({ orderId }: { orderId: string }) => {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found.");

    const trip = await prisma.logisticsTrip.create({
      data: {
        orderId: order.id,
        driverName: "Pending Assignment",
        driverPhone: "00000000",
        originLabel: "Farm Location",
        originLat: 0, originLng: 0,
        destinationLabel: "Buyer Location",
        destinationLat: 0, destinationLng: 0,
        status: "scheduled",
      },
    });
    return { success: true, tripId: trip.id, message: "Shipment scheduled successfully!" };
  },

  // 4. Knowledge Action: Search for Educational Content
  searchCourse: async ({ query }: { query: string }) => {
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 3,
    });
    return { courses };
  },
};

export type AiToolName = keyof typeof aiTools;
