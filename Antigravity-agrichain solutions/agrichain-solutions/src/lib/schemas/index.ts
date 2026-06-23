import { z } from "zod";

export const UserRole = z.enum([
  "producer",
  "cooperative",
  "logistics",
  "industry",
  "consumer",
  "admin",
  "investor",
]);

export const AddressSchema = z.object({
  street: z.string().min(2).max(200),
  city: z.string().min(2).max(120),
  region: z.string().min(2).max(120),
  country: z.string().min(2).max(80),
  postalCode: z.string().max(20).optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

export const ProductSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().min(10).max(2000),
  category: z.string().min(2).max(80),
  price: z.coerce.number().positive(),
  unit: z.string().min(1).max(30),
  quantity: z.coerce.number().nonnegative(),
  minOrder: z.coerce.number().positive().default(1),
  images: z.array(z.string()).default([]),
  origin: z.string().min(2).max(180),
  certifications: z.array(z.string().max(80)).default([]),
  isOrganic: z.boolean().default(false),
  farmId: z.string().uuid().optional(),
  traceCode: z.string().max(80).optional(),
});

export const ProductUpdateSchema = ProductSchema.partial();

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
});

export const OrderSchema = z.object({
  sellerId: z.string().uuid(),
  items: z.array(OrderItemSchema).min(1).max(50),
  shippingAddress: AddressSchema,
  paymentMethod: z.string().default("mobile_money"),
});

export const RegisterSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().min(6).max(40).optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").max(160),
  confirmPassword: z.string().min(8).max(160),
  role: z.enum(["producer", "cooperative", "logistics", "industry", "consumer", "investor"]),
  location: z.string().max(160).optional().or(z.literal("")),
});

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(6000),
});

export const ChatSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(40),
  locale: z.string().default("fr"),
  conversationId: z.string().uuid().optional(),
});

export const SpeakSchema = z.object({
  text: z.string().min(1).max(4000),
  voice: z.string().default("alloy"),
});

export const GpsEventSchema = z.object({
  tripId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speedKph: z.number().min(0).max(400).optional(),
  heading: z.number().min(0).max(360).optional(),
});

export const TraceEventSchema = z.object({
  traceRecordId: z.string().uuid(),
  type: z.string().min(2).max(80),
  title: z.string().min(2).max(160),
  description: z.string().min(2).max(1000),
  location: z.string().min(2).max(180),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const WalletTransferSchema = z.object({
  recipientUserId: z.string().uuid(),
  amount: z.coerce.number().positive().max(1_000_000_000),
  description: z.string().min(3).max(240),
  category: z.string().min(2).max(80).default("transfer"),
});

export const FarmSchema = z.object({
  name: z.string().min(2).max(160),
  region: z.string().max(120).optional(),
  country: z.string().min(2).max(80).default("CI"),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const FieldSchema = z.object({
  farmId: z.string().uuid(),
  name: z.string().min(2).max(160),
  areaHa: z.coerce.number().positive().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const CropSchema = z.object({
  fieldId: z.string().uuid(),
  name: z.string().min(2).max(120),
  variety: z.string().max(120).optional(),
  plantedAt: z.coerce.date().optional(),
  harvestedAt: z.coerce.date().optional(),
});

export const BlockchainAnchorSchema = z.object({
  traceRecordId: z.string().uuid().optional(),
  payload: z.unknown(),
});
