import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date);
}

export async function GET() {
  const user = await requireUser();
  const orderWhere = user.role === "admin" ? {} : { OR: [{ buyerId: user.id }, { sellerId: user.id }] };
  const productWhere = user.role === "admin" ? {} : { sellerId: user.id };
  const tripWhere = user.role === "admin" ? {} : { order: { is: orderWhere } };

  const [orders, products, walletEntries, trips, auditLogs] = await Promise.all([
    prisma.order.findMany({ where: orderWhere, orderBy: { createdAt: "asc" }, include: { items: true } }),
    prisma.product.findMany({ where: productWhere }),
    prisma.walletTransaction.findMany({ where: user.role === "admin" ? {} : { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.logisticsTrip.findMany({ where: tripWhere, take: 20, orderBy: { updatedAt: "desc" } }),
    prisma.auditLog.findMany({ where: user.role === "admin" ? {} : { actorId: user.id }, take: 8, orderBy: { createdAt: "desc" } }),
  ]);

  const completedCredits = walletEntries.filter((entry) => entry.status === "completed" && entry.type === "credit");
  const totalRevenue = completedCredits.reduce((sum, entry) => sum + entry.amount, 0);
  const pendingDeliveries = trips.filter((trip) => ["scheduled", "in_transit"].includes(trip.status)).length;
  const activeProducts = products.filter((product) => product.status === "available").length;

  const monthly = new Map<string, { name: string; value: number; orders: number; delivered: number }>();
  for (const order of orders) {
    const name = monthLabel(order.createdAt);
    const current = monthly.get(name) || { name, value: 0, orders: 0, delivered: 0 };
    current.value += order.totalAmount;
    current.orders += 1;
    current.delivered += order.status === "delivered" ? 1 : 0;
    monthly.set(name, current);
  }

  const categories = new Map<string, number>();
  for (const product of products) {
    categories.set(product.category, (categories.get(product.category) || 0) + 1);
  }

  return NextResponse.json({
    stats: {
      totalRevenue,
      totalOrders: orders.length,
      activeProducts,
      pendingDeliveries,
      customerCount: new Set(orders.map((order) => (order.buyerId === user.id ? order.sellerId : order.buyerId))).size,
      rating: products.length ? products.reduce((sum, product) => sum + product.rating, 0) / products.length : 0,
      revenueChange: 0,
      ordersChange: 0,
    },
    revenueData: [...monthly.values()].map((item) => ({ name: item.name, value: item.value, label: `${Math.round(item.value / 1000)}K` })),
    ordersData: [...monthly.values()].map((item) => ({ name: item.name, value: item.orders, value2: item.delivered })),
    categoryData: [...categories.entries()].map(([name, value]) => ({ name, value })),
    activities: auditLogs.map((log) => ({
      id: log.id,
      type: log.action.includes("order") ? "order" : log.action.includes("auth") ? "system" : "system",
      title: log.action,
      description: `${log.entity}${log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}`,
      timestamp: log.createdAt.toISOString(),
      read: true,
    })),
    weather: {
      location: user.name.includes("Admin") ? "Côte d'Ivoire" : "Daloa, Côte d'Ivoire",
      temperature: 28,
      humidity: 72,
      rainfall: 15,
      windSpeed: 12,
      condition: "Partiellement nuageux",
      forecast: [],
    },
  });
}
