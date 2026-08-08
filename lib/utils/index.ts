import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AccountType, UserRole, type User } from "@/types/api/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDashboardRoute(user: Pick<User, "accountType" | "roles">): string {
  const isAdmin =
    user.roles.includes(UserRole.SUPER_ADMIN) || user.roles.includes(UserRole.ADMIN);
  if (!isAdmin && user.accountType === AccountType.TALENT) return "/home";
  return "/dashboard";
}

