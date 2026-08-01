export const queryKeys = {
  notifications: {
    all: ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
  },
  sessions: {
    all: ["sessions"] as const,
  },
  user: {
    me: () => ["user", "me"] as const,
    all: () => ["user", "list"] as const,
    invitees: () => ["user", "invitees"] as const,
    inviteesList: (page: number, limit: number) =>
      ["user", "invitees", { page, limit }] as const,
  },
};
