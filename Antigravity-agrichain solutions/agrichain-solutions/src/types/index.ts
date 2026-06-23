// ============================================================
// AgriChain Solutions — TypeScript Type Definitions
// ============================================================

// User & Auth
export type UserRole =
  | "producer"
  | "cooperative"
  | "logistics"
  | "industry"
  | "consumer"
  | "admin"
  | "investor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  country?: string;
  language: string;
  isVerified: boolean;
  createdAt: string;
  subscription?: SubscriptionTier;
}

export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";

// Products & Marketplace
export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  currency: string;
  unit: string;
  quantity: number;
  minOrder: number;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  origin: string;
  certifications: string[];
  isOrganic: boolean;
  harvestDate?: string;
  expiryDate?: string;
  traceCode?: string;
  rating: number;
  reviewCount: number;
  status: "available" | "low_stock" | "sold_out";
  createdAt: string;
}

export type ProductCategory =
  | "cocoa"
  | "coffee"
  | "cashew"
  | "palm_oil"
  | "rubber"
  | "cotton"
  | "rice"
  | "maize"
  | "cassava"
  | "yam"
  | "fruits"
  | "vegetables"
  | "spices"
  | "livestock"
  | "fish"
  | "processed";

// Orders
export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Address {
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  coordinates?: { lat: number; lng: number };
}

// Traceability & Blockchain
export interface TraceRecord {
  id: string;
  traceCode: string;
  productName: string;
  productCategory: ProductCategory;
  timeline: TraceEvent[];
  certificates: Certificate[];
  blockchainHash: string;
  qrCode: string;
  origin: TraceOrigin;
  currentHolder: string;
  status: "active" | "completed" | "recalled";
}

export interface TraceEvent {
  id: string;
  type: TraceEventType;
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  actor: string;
  actorRole: UserRole;
  timestamp: string;
  data?: Record<string, unknown>;
  verified: boolean;
  blockchainTx?: string;
}

export type TraceEventType =
  | "planted"
  | "harvested"
  | "collected"
  | "processed"
  | "quality_checked"
  | "stored"
  | "shipped"
  | "received"
  | "sold";

export interface TraceOrigin {
  farm: string;
  farmer: string;
  cooperative?: string;
  region: string;
  country: string;
  coordinates: { lat: number; lng: number };
  plantedDate: string;
  harvestedDate: string;
}

export interface Certificate {
  id: string;
  type: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate: string;
  verified: boolean;
  documentUrl?: string;
}

// Dashboard & Analytics
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  pendingDeliveries: number;
  customerCount: number;
  rating: number;
  revenueChange: number;
  ordersChange: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
  label?: string;
}

export interface Activity {
  id: string;
  type: "order" | "delivery" | "payment" | "review" | "alert" | "system";
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  read: boolean;
}

// AI Advisor
export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: AIAttachment[];
  suggestions?: string[];
}

export interface AIAttachment {
  type: "image" | "chart" | "table" | "map";
  data: unknown;
  title?: string;
}

export interface CropPrediction {
  crop: string;
  region: string;
  predictedYield: number;
  confidence: number;
  recommendations: string[];
  risks: string[];
  optimalPlantingDate: string;
  estimatedHarvestDate: string;
}

// Wallet & Transactions
export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  currency: string;
  description: string;
  category: string;
  reference: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
}

export interface Wallet {
  balance: number;
  currency: string;
  pendingBalance: number;
  totalEarnings: number;
  totalSpent: number;
  transactions: WalletTransaction[];
}

// Notifications
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  timestamp: string;
}

// Cart
export interface CartItem {
  product: Product;
  quantity: number;
}

// i18n
export type Locale =
  | "fr"
  | "en"
  | "es"
  | "pt"
  | "ar"
  | "zh"
  | "dyu"
  | "bci"
  | "adj"
  | "bet"
  | "ati"
  | "yac"
  | "gou"
  | "ak"
  | "ald"
  | "sef"
  | "kxb";

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

// Theme
export type Theme = "light" | "dark";

// Navigation
export interface NavItem {
  key: string;
  label: string;
  icon: string;
  href: string;
  roles?: UserRole[];
  badge?: number;
  children?: NavItem[];
}

// Education
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  lessons: number;
  completedLessons: number;
  instructor: string;
  thumbnail: string;
  rating: number;
}

// Weather
export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  rainfall: number;
}
