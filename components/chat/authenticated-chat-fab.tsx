"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { ChatFab } from "@/components/chat/chat-fab";

export function AuthenticatedChatFab() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) return null;

  return <ChatFab />;
}
