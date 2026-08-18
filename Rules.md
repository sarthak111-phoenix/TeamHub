# Rules.md — Engineering Rules & AI Boundaries

This file defines what any contributor — human or AI — must follow when working in this repo. It exists so an AI assistant working across sessions has a consistent, non-negotiable rule set instead of re-deciding conventions each time. Read this before writing code. See Memory.md before starting any session.

---

## 1. What to Use

- **Next.js App Router** for all routing — no Pages Router.
- **TypeScript** everywhere — no plain `.js` files in `/app`, `/components`, `/server`, `/lib`.
- **Tailwind CSS** for styling — utility-first, no separate large CSS files unless global tokens.
- **One ORM** (Prisma or Drizzle — decided in Architecture.md) for all DB access. No raw SQL outside of migrations unless justified and reviewed.
- **One validation library** (Zod) for all input validation, shared between client and server where possible.
- **One animation library** as primary (decided in Design.md) — keep usage consistent across the app.
- **Server Actions / Route Handlers** for all mutations — never mutate data from the client directly against the DB.
- **Managed auth provider** (Clerk/Supabase Auth) for all authentication — never hand-roll password hashing or session tokens.
- Environment variables for all secrets, loaded via a single typed config module — never inline.

---

## 2. What to Avoid

### Libraries
- Avoid adding a new library for something an already-chosen library covers (e.g. don't add a second date library, a second animation library, a second form library).
- Avoid heavy/unmaintained or rarely-updated packages for core flows (auth, payments-equivalent, data integrity).
- Avoid client-side-only state managers (Redux, etc.) unless local component state / server state (React Query or equivalent) genuinely can't cover the need — for an MVP this size, it usually can.
- Avoid ORMs, query builders, or raw SQL used interchangeably in the same feature — pick one path per query.

### Error Handling
- Never swallow errors silently (`catch {}` with nothing inside).
- Every server action / route handler must return a typed result — success or a structured error — never throw raw, unhandled exceptions to the client.
- User-facing errors must be human-readable and non-technical; log the technical detail server-side only.
- Never leak stack traces, DB errors, or internal identifiers to the client response.
- Every destructive action (delete task, remove member, archive project) requires confirmation server-side validation, not just a client-side confirm dialog.

### Boundaries for AI (Claude or any AI assistant working in this repo)
- **Never invent product requirements.** If a feature isn't in PRD.md, ask or flag it — don't silently add scope.
- **Never change the chosen tech stack** (framework, ORM, auth provider, styling approach) without it being an explicit, discussed decision recorded in Architecture.md.
- **Never remove or weaken server-side authorization checks** to "make something work faster" — this is a hard boundary, not a style preference.
- **Never commit secrets, API keys, or `.env` values** into any file.
- **Always update Memory.md** at the end of a working session: what was completed, what file/feature is in progress, and any decisions made — so future sessions don't re-derive context or hallucinate prior state.
- **Do not mark a phase in Phases.md as complete** unless the corresponding "Must Have" items actually work end-to-end (not just UI scaffolding).
- **Do not silently reinterpret ambiguous requirements** — state the assumption made and proceed, rather than guessing without record (mirrors how this file itself should be used).
- **Do not build "Won't Have" or "Future" items** (per PRD.md §3.4 / MVP.md §10) without an explicit request to pull them into scope.
- When unsure whether a change is a small fix or a scope/architecture change, treat it as the latter and flag it rather than proceeding silently.

---

## 3. Code Quality Baseline
- No `any` type unless justified with a comment.
- Shared types live in `/types`, not duplicated per file.
- Every list/table view must handle: loading state, empty state, error state (see Design.md for the skeleton-loader requirement).
- Every form must validate both client-side (UX) and server-side (security) — client-side validation is never sufficient alone.
- Keep components small and domain-scoped; avoid one large file handling multiple unrelated concerns.

---

## 4. Review Checklist (before considering a feature "done")
- [ ] Server-side authorization enforced
- [ ] Input validated
- [ ] Errors handled and typed, nothing swallowed
- [ ] Loading / empty / error states present
- [ ] Activity log entry written where applicable
- [ ] Notification dispatched where applicable
- [ ] Memory.md updated