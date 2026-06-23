import type { UserRole } from "@/types";

const roleRank: Record<UserRole, number> = {
  consumer: 1,
  producer: 2,
  logistics: 2,
  cooperative: 3,
  industry: 3,
  investor: 3,
  admin: 10,
};

export function canManageResource(userRole: UserRole | undefined, ownerId: string | null | undefined, userId: string | undefined) {
  if (!userRole || !userId) return false;
  if (userRole === "admin") return true;
  return Boolean(ownerId && ownerId === userId);
}

export function hasMinimumRole(userRole: UserRole | undefined, minimum: UserRole) {
  if (!userRole) return false;
  return roleRank[userRole] >= roleRank[minimum];
}

