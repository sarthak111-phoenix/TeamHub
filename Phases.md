# Phases.md — Build Phases

Each phase should be fully working (not just scaffolded) before moving to the next. Update Memory.md as each item is completed.

---

## Phase 0 — Foundation & Setup
- [ ] Repo init, Next.js + TypeScript + Tailwind configured
- [ ] ORM configured, PostgreSQL connected
- [ ] Auth provider integrated (sign up / sign in / sign out)
- [ ] Base folder structure per Architecture.md
- [ ] Shared UI primitives: button, input, modal, toast, skeleton loader
- [ ] Global layout + navigation shell (Dashboard, Tasks, Projects, Team, Activity, My Profile)
- [ ] Role-based route protection (Admin vs Member) working end-to-end

**Exit criteria:** A user can sign up, sign in, land on an empty dashboard, and sign out.

---

## Phase 1 — Core Task Management
- [ ] Task data model + migrations
- [ ] Create task (Admin)
- [ ] Assign/reassign task (Admin)
- [ ] Task list with filters (assignee, status, priority, project, due date)
- [ ] Task detail page
- [ ] Task status updates (Member, for own tasks)
- [ ] Task progress updates / work log
- [ ] Task comments

**Exit criteria:** Admin can create and assign a task; Member can move it through statuses and log progress.

---

## Phase 2 — Projects
- [ ] Project data model + migrations
- [ ] Create/edit project (Admin)
- [ ] Add/remove project members
- [ ] Link tasks to projects
- [ ] Project detail page (overview, related tasks, updates)
- [ ] Project status lifecycle (Planning → Active → On Hold → Completed → Archived)
- [ ] Project comments

**Exit criteria:** Admin can create a project, attach tasks and members, and track it to completion.

---

## Phase 3 — Dashboard, Activity & Completed Work
- [ ] Dashboard aggregation: my tasks, team pending tasks, recent completions, active projects, upcoming deadlines
- [ ] Team activity feed (chronological, human-readable)
- [ ] Completed-work history view (tasks + projects)
- [ ] Basic analytics counts (active/completed/overdue tasks, tasks by member)

**Exit criteria:** Dashboard is genuinely useful immediately after login without further navigation.

---

## Phase 4 — Notifications & Member Profiles
- [ ] Notification data model + dispatch logic (assigned, reassigned, status changed, deadline approaching, project update)
- [ ] In-app notification center
- [ ] Member profile page (bio, stats, assigned/completed tasks, active/completed projects)
- [ ] Profile image upload

**Exit criteria:** Assigning a task notifies the member; profiles reflect real activity.

---

## Phase 5 — Polish, Search, Security Hardening
- [ ] Global search across tasks/projects/members
- [ ] Responsive pass (mobile/tablet)
- [ ] Empty states, confirmation dialogs, toast feedback everywhere
- [ ] Skeleton loaders on all data-fetching views (see Design.md, Security.md)
- [ ] Rate limiting applied per-route (see Security.md)
- [ ] Security review pass (auth boundaries, input validation, audit logging)

**Exit criteria:** MVP "Must Have" list in PRD.md is fully satisfied and the app can be handed to a real team for one real project.

---

## Phase 6 — Should-Have Enhancements (post-MVP validation)
- [ ] Overdue task indicators
- [ ] Activity feed filtering
- [ ] Notification center refinements
- [ ] Basic analytics expansion

## Phase 7 — Could-Have (only after real usage feedback)
- [ ] Real-time chat
- [ ] File attachments
- [ ] Direct messaging
- [ ] Recurring tasks
- [ ] Email notifications
- [ ] Weekly summary reports

> Do not start a Could-Have item while any Must-Have item is incomplete. Do not build Won't-Have items (see PRD.md §3.4) without an explicit scope change discussion.