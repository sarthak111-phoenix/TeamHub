# Architecture.md — App Flow, Structure & Tech Stack

---

## 1. Tech Stack

### Frontend
- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS** for styling
- Animation: evaluate **Motion (Framer Motion)** for component/page transitions and **Anime.js** for micro-interactions/decorative motion once Design.md direction is locked. Don't mix both broadly — pick one primary animation engine, use the other only for a narrow, justified case (e.g. SVG path effects).

### Backend
- Next.js **Route Handlers** / **Server Actions** as the API layer
- All authorization enforced **server-side**, never trusted from the client
- Centralized input validation (e.g. Zod schemas shared between client and server)

### Database
- **PostgreSQL**
- Access via a typed ORM (e.g. Prisma or Drizzle) — pick one early and don't switch mid-MVP

### Authentication
- Managed provider: **Clerk** or **Supabase Auth**
- No self-rolled password storage/hashing

### Storage
- Object storage (e.g. Supabase Storage / S3-compatible) for profile images, future attachments

### Realtime (optional, post-core)
- Managed realtime service (e.g. Supabase Realtime / Pusher) for activity feed & chat — not required for MVP correctness

---

## 2. High-Level App Flow

```
User → Auth (sign in/up) → Session established
      → Dashboard (default landing page)
            ├── Tasks module      → Task detail → Updates / Comments
            ├── Projects module   → Project detail → Related tasks/updates
            ├── Team module       → Member list → Member profile
            ├── Activity feed     → Read-only chronological log
            └── My Profile        → Own stats & settings

Admin-only branch:
      → Admin/Team Management → invite/manage members, roles
      → User Management        → reassign, deactivate, audit
```

Every write action (create/update task, project, comment) triggers:
1. Server-side authorization check
2. DB write
3. Activity record insert
4. Notification dispatch (if applicable)

---

## 3. Data Flow Pattern

```
Client (React component)
   → calls Server Action / Route Handler
      → validate input (schema)
      → check auth + role + resource ownership
      → perform DB operation (transaction where multiple writes are linked,
        e.g. task update + activity log + notification)
      → return typed result
   → client updates UI (optimistic where safe, otherwise on confirmation)
```

---

## 4. Folder & File Structure (proposed)

```
/app
  /(auth)
    /sign-in
    /sign-up
  /(dashboard)
    /dashboard
    /tasks
      /[taskId]
    /projects
      /[projectId]
    /team
      /[memberId]
    /activity
    /profile
    /admin
      /members
      /settings
  /api
    /webhooks           # auth provider webhooks, etc.
  layout.tsx
  globals.css

/components
  /ui                   # shared primitives (button, input, modal, skeleton, etc.)
  /dashboard
  /tasks
  /projects
  /team
  /activity
  /notifications

/lib
  /auth                 # session helpers, role checks
  /db                    # ORM client, query helpers
  /validation             # shared zod schemas
  /notifications           # notification dispatch logic
  /activity                # activity-log writer
  /rate-limit               # rate limiting utilities (see Security.md)
  utils.ts

/server
  /actions               # server actions grouped by domain (tasks.ts, projects.ts, ...)

/types                    # shared TS types/interfaces

/prisma  (or /drizzle)
  schema.prisma

/public
  /images

/docs
  PRD.md
  Architecture.md
  Rules.md
  Phases.md
  Design.md
  Memory.md
  Security.md
```

Guiding rules for structure:
- Group by **domain** (tasks, projects, team) inside `/app`, `/components`, `/server/actions` — not by technical layer alone.
- Keep `/lib` for cross-cutting, stateless utilities only.
- No business logic inside React components beyond presentation + calling server actions.
- Every domain that writes data must also write to `activity` inside the same transaction.

---

## 5. Core Entities (from MVP data model)

`User`, `Task`, `TaskUpdate`, `Project`, `ProjectMember`, `Comment`, `Activity`, `Notification` — see PRD.md / original MVP for field-level detail. Architecture decisions must keep these entities relationally simple (foreign keys, no premature denormalization) until real usage data justifies optimization.

---

## 6. Scalability Notes (not MVP-blocking, but design-aware)
- Keep `Activity` and `Notification` tables append-mostly and indexed by `user_id` / `created_at` for cheap feed queries.
- Keep authorization logic centralized in `/lib/auth` so role rules aren't duplicated per route.
- Structure `/server/actions` so a future multi-tenant `workspace_id` column could be added without a full rewrite (design entities with this in mind, don't implement it now).