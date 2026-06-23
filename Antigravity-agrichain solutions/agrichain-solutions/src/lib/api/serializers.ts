import type { Order, Product, TraceRecord, Wallet, WalletTransaction } from "@/types";

type JsonArray = unknown[] | string | null;

export function arrayFromJson<T>(value: JsonArray, fallback: T[] = []): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function productDto(product: any): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    currency: product.currency,
    unit: product.unit,
    quantity: product.quantity,
    minOrder: product.minOrder,
    images: arrayFromJson<string>(product.images),
    sellerId: product.sellerId,
    sellerName: product.seller?.name || "Vendeur vérifié",
    sellerRating: 4.8,
    origin: product.origin,
    certifications: arrayFromJson<string>(product.certifications),
    isOrganic: product.isOrganic,
    harvestDate: product.harvestDate?.toISOString?.() || product.harvestDate || undefined,
    expiryDate: product.expiryDate?.toISOString?.() || product.expiryDate || undefined,
    traceCode: product.traceCode || undefined,
    rating: product.rating,
    reviewCount: product.reviewCount,
    status: product.status,
    createdAt: product.createdAt?.toISOString?.() || product.createdAt,
  };
}

export function orderDto(order: any): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    items: order.items.map((item: any) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      unit: item.unit,
    })),
    totalAmount: order.totalAmount,
    currency: order.currency,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    shippingAddress: order.shippingAddress,
    trackingNumber: order.trackingNumber || undefined,
    estimatedDelivery: order.estimatedDelivery?.toISOString?.() || order.estimatedDelivery || undefined,
    actualDelivery: order.actualDelivery?.toISOString?.() || order.actualDelivery || undefined,
    createdAt: order.createdAt?.toISOString?.() || order.createdAt,
    updatedAt: order.updatedAt?.toISOString?.() || order.updatedAt,
  };
}

export function traceDto(trace: any): TraceRecord {
  return {
    id: trace.id,
    traceCode: trace.traceCode,
    productName: trace.productName,
    productCategory: trace.productCategory,
    timeline: trace.events.map((event: any) => ({
      id: event.id,
      type: event.type,
      title: event.title,
      description: event.description,
      location: event.location,
      coordinates: event.latitude && event.longitude ? { lat: event.latitude, lng: event.longitude } : undefined,
      actor: event.actor,
      actorRole: event.actorRole,
      timestamp: event.timestamp?.toISOString?.() || event.timestamp,
      data: event.data || undefined,
      verified: event.verified,
      blockchainTx: event.blockchainTx || undefined,
    })),
    certificates: trace.certificates.map((certificate: any) => ({
      id: certificate.id,
      type: certificate.type,
      name: certificate.name,
      issuer: certificate.issuer,
      issuedDate: certificate.issuedDate?.toISOString?.() || certificate.issuedDate,
      expiryDate: certificate.expiryDate?.toISOString?.() || certificate.expiryDate,
      verified: certificate.verified,
      documentUrl: certificate.documentUrl || undefined,
    })),
    blockchainHash: trace.blockchainHash,
    qrCode: trace.qrCode,
    origin: trace.origin,
    currentHolder: trace.currentHolder,
    status: trace.status,
  };
}

export function walletDto(entries: any[]): Wallet {
  const transactions: WalletTransaction[] = entries.map((entry) => ({
    id: entry.id,
    type: entry.type,
    amount: entry.amount,
    currency: entry.currency,
    description: entry.description,
    category: entry.category,
    reference: entry.reference,
    status: entry.status,
    timestamp: entry.createdAt?.toISOString?.() || entry.createdAt,
  }));

  const completed = transactions.filter((transaction) => transaction.status === "completed");
  const pending = transactions.filter((transaction) => transaction.status === "pending");
  const balance = completed.reduce((sum, transaction) => sum + (transaction.type === "credit" ? transaction.amount : -transaction.amount), 0);
  const pendingBalance = pending.reduce((sum, transaction) => sum + (transaction.type === "credit" ? transaction.amount : -transaction.amount), 0);

  return {
    balance,
    currency: "XOF",
    pendingBalance,
    totalEarnings: completed.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0),
    totalSpent: completed.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0),
    transactions,
  };
}

