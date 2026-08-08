"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { chatSocket } from "@/lib/chat/socket";
import { usePresenceStore } from "@/store/presenceStore";

interface PresencePayload {
  userId?: string;
}

/**
 * Keeps the chat socket connected for authenticated users and streams
 * presence.online / presence.offline events into the presence store.
 * Call once at a global level (e.g. the floating chat widget).
 */
export function useChatPresence() {
  const { isAuthenticated, isLoading } = useAuth();
  const setOnline = usePresenceStore((s) => s.setOnline);
  const setOffline = usePresenceStore((s) => s.setOffline);
  const reset = usePresenceStore((s) => s.reset);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const socket = chatSocket.connect();

    const offOnline = chatSocket.on(
      "presence.online",
      (payload: PresencePayload) => {
        if (payload?.userId) setOnline(payload.userId);
      },
    );
    const offOffline = chatSocket.on(
      "presence.offline",
      (payload: PresencePayload) => {
        if (payload?.userId) setOffline(payload.userId);
      },
    );
    const offDisconnect = chatSocket.on("disconnect", () => {
      reset();
    });

    return () => {
      offOnline();
      offOffline();
      offDisconnect();
    };
  }, [isAuthenticated, isLoading, setOnline, setOffline, reset]);

  return usePresenceStore((s) => s.isOnline);
}

/**
 * Reactive per-user online status. Re-renders when that user's presence
 * changes (via socket events or store updates).
 */
export function useIsOnline(userId?: string) {
  return usePresenceStore((s) => (userId ? !!s.onlineUserIds[userId] : false));
}

/**
 * Merge REST-provided isOnline flags into the store so status is accurate
 * before any socket events arrive (no-op for offline entries).
 */
export function useSeedPresence(
  items: Array<{ userId?: string; isOnline?: boolean }>,
) {
  const setOnline = usePresenceStore((s) => s.setOnline);
  useEffect(() => {
    for (const item of items ?? []) {
      if (item?.userId && item.isOnline) setOnline(item.userId);
    }
  }, [items, setOnline]);
}
