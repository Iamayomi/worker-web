export const queryKeys = {
  notifications: {
    all: ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
    preferences: () => ["notifications", "preferences"] as const,
  },
  sessions: {
    all: ["sessions"] as const,
  },
  user: {
    me: () => ["user", "me"] as const,
    all: () => ["user", "list"] as const,
    invitees: () => ["user", "invitees"] as const,
    inviteesList: (page: number, limit: number, accountType?: string) =>
      ["user", "invitees", { page, limit, accountType }] as const,
    adminDashboard: (params?: object) =>
      ["user", "admin", "dashboard", params] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    list: (params: object) => ["jobs", "list", params] as const,
    detail: (id: string) => ["jobs", "detail", id] as const,
    mine: (params: object) => ["jobs", "mine", params] as const,
    recommendations: (limit: number) =>
      ["jobs", "recommendations", { limit }] as const,
    analytics: (params?: object) => ["jobs", "analytics", params] as const,
  },
  applications: {
    all: ["applications"] as const,
    list: (params: object) =>
      ["applications", "list", params] as const,
    detail: (id: string) => ["applications", "detail", id] as const,
    byJob: (jobId: string, params: object) =>
      ["applications", "byJob", jobId, params] as const,
    analytics: (params?: object) =>
      ["applications", "analytics", params] as const,
  },
  savedJobs: {
    all: ["savedJobs"] as const,
    ids: () => ["savedJobs", "ids"] as const,
    list: (params: object) => ["savedJobs", "list", params] as const,
  },
  profiles: {
    clientMe: () => ["profiles", "client", "me"] as const,
    talentMe: () => ["profiles", "talent", "me"] as const,
  },
  content: {
    all: () => ["content", "posts"] as const,
    list: (params: object) => ["content", "posts", "list", params] as const,
    detail: (slug: string) => ["content", "posts", "detail", slug] as const,
    adminList: (params: object) =>
      ["content", "posts", "admin", params] as const,
  },
  pages: {
    all: () => ["content", "pages"] as const,
    bySlug: (slug: string) => ["content", "pages", slug] as const,
    adminList: () => ["content", "pages", "admin"] as const,
  },
  chat: {
    all: ["chat"] as const,
    conversations: (params: object) => ["chat", "conversations", params] as const,
    conversation: (id: string) => ["chat", "conversations", id] as const,
    messages: (conversationId: string) =>
      ["chat", "conversations", conversationId, "messages"] as const,
    unreadCount: () => ["chat", "unread-count"] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    talent: (days?: number) => ["analytics", "talent", { days }] as const,
    client: (days?: number) => ["analytics", "client", { days }] as const,
    preferences: () => ["analytics", "preferences"] as const,
  },
};
