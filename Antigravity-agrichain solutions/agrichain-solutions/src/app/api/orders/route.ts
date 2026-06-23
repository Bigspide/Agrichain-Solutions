import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { orderDto } from "@/lib/api/serializers";

const orderSchema = z.object({
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

export async function GET() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: user.role === "admin" ? {} : { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  return NextResponse.json({ orders: orders.map(orderDto) });
}

export async function POST(request: Request) {
  const user = await requireUser();
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.items.map((item) => item.productId) } },
  });
  if (products.length !== parsed.data.items.length) {
    return NextResponse.json({ error: "One or more products were not found" }, { status: 404 });
  }

  const totalAmount = parsed.data.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: `AGR-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      buyerId: user.id,
      sellerId: parsed.data.sellerId,
      totalAmount,
      currency: "XOF",
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: parsed.data.paymentMethod,
      shippingAddress: parsed.data.shippingAddress,
      items: {
        create: parsed.data.items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
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
    include: { items: true },
  });

  await prisma.auditLog.create({
    data: { actorId: user.id, action: "order.create", entity: "Order", entityId: order.id, metadata: { totalAmount } },
  });

  return NextResponse.json({ order: orderDto(order) }, { status: 201 });
}

