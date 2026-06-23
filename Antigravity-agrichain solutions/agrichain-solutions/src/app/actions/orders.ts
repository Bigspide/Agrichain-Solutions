"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { canManageResource } from "@/lib/security/rbac";

const createOrderSchema = z.object({
  sellerId: z.string().uuid(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.coerce.number().positive() })).min(1),
  shippingAddress: z.object({
    street: z.string().min(2),
    city: z.string().min(2),
    region: z.string().min(2),
    country: z.string().min(2),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }),
  paymentMethod: z.string().default("mobile_money"),
});

export async function createOrderAction(input: unknown) {
  const user = await requireUser();
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT", details: parsed.error.flatten() };

  const products = await prisma.product.findMany({ where: { id: { in: parsed.data.items.map((item) => item.productId) } } });
  if (products.length !== parsed.data.items.length) return { ok: false, error: "PRODUCT_NOT_FOUND" };

  const totalAmount = parsed.data.items.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: `AGR-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      buyerId: user.id,
      sellerId: parsed.data.sellerId,
      totalAmount,
      currency: "XOF",
      paymentMethod: parsed.data.paymentMethod,
      shippingAddress: parsed.data.shippingAddress,
      items: {
        create: parsed.data.items.map((item) => {
          const product = products.find((candidate) => candidate.id === item.productId)!;
          return {
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            totalPrice: product.price * item.quantity,
            unit: product.unit,
          };
        }),
      },
    },
  });

  await prisma.auditLog.create({ data: { actorId: user.id, action: "order.create", entity: "Order", entityId: order.id, metadata: { totalAmount } } });
  revalidatePath("/dashboard/orders");
  return { ok: true, orderId: order.id };
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  const user = await requireUser();
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { sellerId: true, buyerId: true } });
  if (!order || (!canManageResource(user.role, order.sellerId, user.id) && !canManageResource(user.role, order.buyerId, user.id))) {
    return { ok: false, error: "FORBIDDEN" };
  }

  const allowed = ["pending", "confirmed", "processing", "shipped", "in_transit", "delivered", "cancelled", "refunded"];
  if (!allowed.includes(status)) return { ok: false, error: "INVALID_STATUS" };

  await prisma.order.update({ where: { id: orderId }, data: { status } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "order.status.update", entity: "Order", entityId: orderId, metadata: { status } } });
  revalidatePath("/dashboard/orders");
  return { ok: true };
}
