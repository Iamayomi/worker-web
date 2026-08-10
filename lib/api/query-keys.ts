export const queryKeys = {
  notifications: {
    all: ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
    preferences: () => ["notifications", "preferences"] as const,
    adminList: (params: object) =>
      ["notifications", "admin", "list", params] as const,
    adminStats: () => ["notifications", "admin", "stats"] as const,
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
  interviews: {
    all: ["interviews"] as const,
    list: (params: object) => ["interviews", "list", params] as const,
    detail: (id: string) => ["interviews", "detail", id] as const,
    calendar: (params: object) =>
      ["interviews", "calendar", params] as const,
  },
  googleCalendar: {
    all: ["google-calendar"] as const,
    status: () => ["google-calendar", "status"] as const,
  },
  savedJobs: {
    all: ["savedJobs"] as const,
    ids: () => ["savedJobs", "ids"] as const,
    list: (params: object) => ["savedJobs", "list", params] as const,
  },
  profiles: {
    clientMe: () => ["profiles", "client", "me"] as const,
    talentMe: () => ["profiles", "talent", "me"] as const,
    experiences: () => ["profiles", "talent", "experiences"] as const,
    education: () => ["profiles", "talent", "education"] as const,
    certifications: () => ["profiles", "talent", "certifications"] as const,
    publicExperiences: (talentProfileId: string) =>
      ["profiles", "talent", "experiences", "public", talentProfileId] as const,
    publicEducation: (talentProfileId: string) =>
      ["profiles", "talent", "education", "public", talentProfileId] as const,
    publicCertifications: (talentProfileId: string) =>
      ["profiles", "talent", "certifications", "public", talentProfileId] as const,
  },
  content: {
    all: () => ["content", "posts"] as const,
    list: (params: object) => ["content", "posts", "list", params] as const,
    detail: (slug: string) => ["content", "posts", "detail", slug] as const,
    adminList: (params: object) =>
      ["content", "posts", "admin", params] as const,
    adminDetail: (id: string) => ["content", "posts", "admin", id] as const,
  },
  pages: {
    all: () => ["content", "pages"] as const,
    bySlug: (slug: string) => ["content", "pages", slug] as const,
    adminList: () => ["content", "pages", "admin"] as const,
    adminDetail: (id: string) => ["content", "pages", "admin", id] as const,
    list: (params: object) => ["content", "pages", "list", params] as const,
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
  health: {
    all: () => ["health", "all"] as const,
    live: () => ["health", "live"] as const,
    ready: () => ["health", "ready"] as const,
    metrics: () => ["health", "metrics"] as const,
  },
  community: {
    all: () => ["community"] as const,
    list: (params: object) => ["community", "list", params] as const,
    mine: (params: object) => ["community", "mine", params] as const,
    detail: (id: string) => ["community", "detail", id] as const,
    members: (communityId: string, params: object) =>
      ["community", "members", communityId, params] as const,
    posts: (communityId: string, params: object) =>
      ["community", "posts", communityId, params] as const,
    post: (communityId: string, postId: string) =>
      ["community", "posts", communityId, postId] as const,
    comments: (postId: string, params: object) =>
      ["community", "comments", postId, params] as const,
    events: (communityId: string, params: object) =>
      ["community", "events", communityId, params] as const,
    event: (communityId: string, eventId: string) =>
      ["community", "events", communityId, eventId] as const,
    rsvps: (eventId: string, params: object) =>
      ["community", "events", eventId, "rsvps", params] as const,
    feed: (params: object) => ["community", "feed", params] as const,
    trending: (params: object) =>
      ["community", "trending", params] as const,
  },
};
