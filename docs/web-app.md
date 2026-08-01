# Worker — Web App Plan

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix Nova) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Auth | JWT (Bearer token from Worker API) |
| Auth lib | AuthProvider context + middleware.ts |
| API client | fetch-based, typed |

## Route Structure

```
/                        → Landing page (marketing)
/(dashboard)/
├── login                → Login page
├── register             → Registration
├── jobs/                → Job listings
├── jobs/[id]            → Job detail
├── talent/              → Talent profiles
├── community/           → Community posts
├── messages/            → Chat
├── settings/            → User settings
├── admin/               → Super admin dashboard
└── layout.tsx           → Sidebar + topbar layout

/api/                    → Next.js API routes (proxy to Worker BE)
```

## Phases

### Phase 1 — Scaffolding (current)
- Auth infrastructure (AuthProvider, token management)
- Dashboard layout shell
- Login page wired to Worker API
- Route protection middleware

### Phase 2 — Landing Page
- Hero, features, how-it-works, pricing sections
- Responsive, animated, SEO-optimized

### Phase 3 — Core Dashboard
- Jobs (list, detail, create, apply)
- Talent profiles (view, edit)
- Community (posts, comments)

### Phase 4 — Extended
- Messaging/Chat
- Admin panel
- Notifications
- Settings

## Auth Flow

1. User submits email + password to `POST /api/v1/auth/login`
2. Backend returns `{ access_token, refresh_token }`
3. Tokens stored in localStorage, `access_token` set on API client
4. AuthProvider reads token on mount, fetches `/api/v1/auth/me` for user info
5. `middleware.ts` checks for token cookie on protected routes, redirects to `/login`
6. API client auto-refreshes on 401 via interceptor

## API Client

Single typed client in `lib/api/worker.ts`:

```ts
worker.get<Job[]>("/jobs")
worker.post<LoginData>("/auth/login", body)
worker.authPost<T>("/jobs", body)  // includes Bearer token
```

