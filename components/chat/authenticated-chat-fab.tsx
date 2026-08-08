"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { FloatingChat } from "@/components/chat/floating-chat";

export function AuthenticatedChatFab() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) return null;

  return <FloatingChat />;
}
