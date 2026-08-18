# Security.md — Security, Rate Limiting & Resilience

This file defines the ongoing security practices, rate-limiting strategy, and performance-resilience behavior (skeleton loading) for the platform. It complements Rules.md §2 (error handling / AI boundaries) — this file is the operational security layer.

---

## 1. Regular Security Checkups

Treat security review as a recurring task, not a one-time pass.

- **Per-phase review:** at the end of every phase in Phases.md, run through the Rules.md §4 checklist for every feature shipped in that phase (authorization enforced, input validated, errors handled, no data leakage).
- **Recurring audit checklist (run periodically, e.g. monthly or before any release):**
  - [ ] All server actions/route handlers re-verify auth + role server-side (never trust client-sent role/user id).
  - [ ] All DB queries scoped to the correct user/permission boundary (a Member query can never return another member's private data by accident).
  - [ ] Dependency audit (`npm audit` / equivalent) run and high/critical issues triaged.
  - [ ] Auth provider configuration reviewed (session expiry, password/OTP policy, allowed redirect URLs).
  - [ ] Admin-only routes spot-checked by attempting access as a Member account.
  - [ ] Secrets confirmed absent from client bundles and git history.
  - [ ] Audit log (see §3) spot-checked for anomalies.
- Record findings and fixes in Memory.md §5 (Known Issues) or §4 (Key Decisions) as appropriate, so recurring issues are tracked over time rather than rediscovered.

---

## 2. Rate Limiting

### 2.1 Principle
Rate limits protect against abuse (credential stuffing on sign-in, spam task/comment creation, scraping) without punishing normal team usage. Limits should be **per-route-category**, not one global limit for the whole app — different pages have very different legitimate call volumes.

### 2.2 Suggested Rate-Limit Buckets (divided by page/route type)

| Bucket | Example routes | Suggested limit style | Rationale |
|---|---|---|---|
| Auth | sign-in, sign-up, password/OTP requests | Strict (e.g. 5–10 attempts / 5–15 min per IP + per account) | Prevent credential stuffing / brute force |
| Write-heavy: Tasks/Comments | create task, update status, add comment/update | Moderate (e.g. 30–60 / min per user) | Allows normal fast task management, blocks scripted spam |
| Write: Projects/Admin actions | create/edit project, manage members | Moderate-strict (e.g. 10–20 / min per user) | Lower legitimate frequency than task updates |
| Read: Dashboard/Activity/Search | dashboard load, activity feed, search queries | Generous but capped (e.g. 60–120 / min per user) | High legitimate frequency (polling, refresh), still capped against scraping/loops |
| File/Image upload | profile image, future attachments | Strict by size + count (e.g. 5–10 / hour per user) | Storage and abuse cost is higher per request |

- Implement via a shared `/lib/rate-limit` utility (Architecture.md §4) so every route uses the same mechanism and bucket definitions instead of ad hoc per-route logic.
- Use a durable store for limits (e.g. Redis or the managed rate-limit feature of the auth/infra provider) rather than in-memory counters, since serverless instances don't share memory.
- Return a clear, typed rate-limit error to the client (per Rules.md error-handling rules) — never a raw 429 with no message.

---

## 3. Flagging Suspicious Signups & Activity

- **Signup flags:** disposable/temp email domains, rapid repeated signups from the same IP, signups immediately followed by bulk data access, mismatched or missing profile info combined with high early-activity volume.
- **Activity flags:** unusual volume of task/project creation or deletion in a short window, repeated failed authorization attempts (a Member repeatedly hitting admin-only routes), bulk data export/read patterns, activity outside normal usage hours at unusual volume (context-dependent, not an automatic block).
- Flagged events should be written to an **audit/security log** (can reuse or extend the `Activity` table with a `flagged: boolean` / `flag_reason` field, or a dedicated `SecurityEvent` table) rather than silently blocking — for MVP scale, flag-and-review is more appropriate than automated hard-blocking except for clear abuse (e.g. auth brute force, which should hard rate-limit).
- Admins should be able to view flagged events (post-MVP "Should Have" if not in initial release) rather than this being invisible.

---

## 4. Skeleton Loading for Slow/High-Latency States

**Requirement:** every data-driven view must show a skeleton loader — matching the real layout's shape — while its data is being fetched, rather than a blank screen or a generic spinner. This is both a UX requirement (Design.md §4) and a resilience requirement here: it keeps the app usable-feeling even when backend latency spikes or a query is slow.

- Applies to: Dashboard widgets, Task list/detail, Project list/detail, Activity feed, Member profile, Search results.
- Trigger condition: any fetch expected to render data should show its skeleton immediately on mount/navigation, not only after a delay threshold — this avoids a flash-then-skeleton flicker and ensures slow responses never show a blank page.
- If a fetch exceeds a reasonable timeout (e.g. several seconds), the skeleton should be paired with a non-blocking notice (e.g. "still loading…") rather than the app appearing frozen or crashing; genuine failures should fall back to a typed error state (per Rules.md), not an indefinite skeleton.
- Skeletons should be built once as shared components (`/components/ui/skeleton`) and composed per view, not re-implemented per page, so the loading experience stays visually consistent app-wide.

---

## 5. Summary of Hard Rules
- No route without server-side auth + rate limiting.
- No silent security failures — flag, log, or block; never ignore.
- No blank/frozen screens under latency — skeleton loaders are mandatory on all data views.
- Security checkups are recurring, not a one-time task — track findings in Memory.md.