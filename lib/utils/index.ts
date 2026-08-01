import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@/types/api/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDashboardRoute(user: Pick<User, "accountType" | "roles">): string {
  void user;
  return "/settings";
}

