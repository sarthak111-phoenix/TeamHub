# PRD.md — Product Requirement Document

**Product:** Team Hub / PS Phoenix Hub
**Type:** Internal team collaboration & work-tracking platform
**Source:** Derived from MVP.md

---

## 1. What to Build

A lightweight internal collaboration platform that replaces scattered coordination (WhatsApp, spreadsheets, docs, verbal updates) with a single team workspace.

The product must let a team:

1. Sign in securely with role-based access (Admin / Member).
2. See a live overview of what's happening across the team (Dashboard).
3. Create, assign, and track tasks with clear ownership, priority, and status.
4. Log progress on tasks without needing formal daily reports.
5. Communicate around tasks and projects (comments, feed, notifications).
6. Organize work into Projects with their own lifecycle.
7. Maintain a permanent, searchable history of completed work.
8. View a chronological Activity Feed of team events.
9. Maintain individual Member Profiles with contribution history.

**Core question the product must answer at a glance:**
> "Who is doing what, what has been done, and what needs to happen next?"

**Design principle:** Build the simplest system that reliably answers that question — without an architecture that blocks future growth into a fuller collaboration/PM platform.

---

## 2. Targeted Users

### 2.1 Team Member
- Views assigned tasks and updates their status.
- Adds progress notes / work-log entries.
- Comments on tasks and projects.
- Views projects they belong to.
- Marks their own work completed.
- Views their own activity, stats, and profile.

### 2.2 Admin / Team Lead
Everything a Member can do, plus:
- Adds/manages team members.
- Creates, assigns, and reassigns tasks for anyone.
- Creates and manages projects.
- Monitors team-wide progress and completed work.
- Manages basic team/workspace settings.

### 2.3 Non-users (explicitly out of scope for MVP)
- External clients/guests.
- Multiple organizations/tenants (unless the architecture supports it without MVP delay).
- Public/social audiences.

---

## 3. Features

### 3.1 Must Have (MVP Release)
- Authentication (sign up / sign in / sign out, secure sessions)
- Role-based access: Admin, Member
- Dashboard: my tasks (pending/in-progress/completed), team pending tasks, recent completions, active projects, recent activity, upcoming deadlines
- Task CRUD: title, description, assignee, creator, priority, status, due date, timestamps, optional project link
- Task status: To Do, In Progress, Blocked, Completed
- Task priority: Low, Medium, High, Urgent
- Task progress updates / work log (author, timestamp, text)
- Task comments
- Project CRUD: name, description, status, owner, members, dates, related tasks, updates
- Project status: Planning, Active, On Hold, Completed, Archived
- Completed-work history (tasks + projects, who/when/notes)
- Team activity feed (chronological, human-readable events)
- Member profiles (image, name, role, bio, joined date, task/project stats)
- Basic notifications (assigned, reassigned, mentioned, status changed, deadline approaching, project update)
- Search and filtering (by assignee, status, priority, project, due date)
- Responsive UI (desktop + mobile)
- Server-side authorization enforced everywhere

### 3.2 Should Have
- Profile images
- Project comments
- Overdue task indicators
- Basic analytics (counts, breakdowns)
- Activity feed filtering
- Notification center (in-app, persistent)

### 3.3 Could Have
- Real-time team chat
- File attachments
- Direct messaging
- Recurring tasks
- Email notifications
- Weekly summary reports

### 3.4 Won't Have in MVP
- Video calls
- Advanced AI features (beyond a validated future case)
- Complex HR / payroll / employee monitoring
- Advanced enterprise analytics/BI
- Full Jira/Slack feature parity
- Multi-tenant orgs (unless free architecturally)

---

## 4. Core User Flows (Summary)

| Flow | Actor | Outcome |
|---|---|---|
| A — Assign Work | Admin | Task created, assigned, notification sent |
| B — Complete Work | Member | Task moved To Do → In Progress → Completed, enters history |
| C — Create Project | Admin | Project created, members + tasks attached, tracked to completion |
| D — Review Progress | Member/Admin | Dashboard → active tasks, deadlines, recent activity |

---

## 5. Success Criteria

MVP is successful if a small team adopts it as the primary work hub for at least one real project, and any user can quickly answer:

1. What do I need to do?
2. What is everyone else working on?
3. What is overdue or blocked?
4. What work did we complete?
5. What projects are active?
6. Who is responsible for a task?
7. What happened recently?
8. Where can I discuss a task or project?

---

## 6. Open Items for Future PRD Iteration
- Exact team size / single vs. multi-workspace
- Single vs. multiple task assignees
- Recurring tasks
- File attachments
- Deeper reporting (weekly/monthly, exports)
- Real-time infrastructure decision
- AI features — only after a validated need