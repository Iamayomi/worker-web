import { create } from "zustand";

type PresenceState = {
  onlineUserIds: Record<string, true>;
  setOnline: (userId: string) => void;
  setOffline: (userId: string) => void;
  reset: () => void;
  isOnline: (userId?: string) => boolean;
};

export const usePresenceStore = create<PresenceState>()((set, get) => ({
  onlineUserIds: {},
  setOnline: (userId) =>
    set((state) => {
      if (!userId || state.onlineUserIds[userId]) return state;
      return { onlineUserIds: { ...state.onlineUserIds, [userId]: true } };
    }),
  setOffline: (userId) =>
    set((state) => {
      if (!userId || !state.onlineUserIds[userId]) return state;
      const next = { ...state.onlineUserIds };
      delete next[userId];
      return { onlineUserIds: next };
    }),
  reset: () => set({ onlineUserIds: {} }),
  isOnline: (userId) => (userId ? !!get().onlineUserIds[userId] : false),
}));
