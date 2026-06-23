import { auth } from "@/auth";
import type { User, UserRole } from "@/types";

export async function getCurrentUser() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name || "AgriChain User",
    role: (user.role || "consumer") as UserRole,
    image: user.image || "",
    phone: user.phone ?? null,
    country: user.country ?? "CI",
    language: user.language ?? "fr",
    isVerified: user.isVerified ?? false,
    createdAt: user.createdAt ?? null,
    subscription: user.subscription ?? "starter",
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

