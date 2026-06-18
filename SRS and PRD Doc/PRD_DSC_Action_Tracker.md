# Product Requirements Document (PRD)
## DSC Action Tracker — Web Application

**Version:** 1.0
**Author:** Davis (DSC Head, Offshore)
**Date:** June 2026
**Status:** Draft — ready for build

---

## 1. Background & Context

DataSkate is building the DataSkate Sales Support Center (DSC) — a structured engine to expand MuleSoft AE coverage, capture lost deals, build recurring revenue, and become MuleSoft AEs' preferred implementation partner. Execution is organized into three action buckets:

1. **AE Engagement & Credibility** — expanding AE coverage from 30 to 100, building trust
2. **Client Outreach & Lead Generation** — email/LinkedIn outreach, 24-hour turnaround promise
3. **Content Management & Distribution** — Digital Sales Room, case studies, AE personas

June is the foundation month (hiring, infrastructure setup); July is execution kickoff. The team is small, partly offshore (Pune) and partly onsite (US field), and currently tracks actions in a spreadsheet. As the team grows and the cadence of work increases, a shared, always-current, easy-to-update tool is needed to track who owns what, what's overdue, and how each bucket is progressing — replacing the static spreadsheet with something the whole team can log into and update live.

---

## 2. Problem Statement

The current tracking method (a spreadsheet) works for one person updating it, but breaks down once multiple people need to update statuses simultaneously, see real-time progress, and be held accountable without someone manually chasing updates. There's no single source of truth that's both easy to update and easy to glance at for a leadership update.

---

## 3. Goals

- Give the DSC team (Davis, Vivek, Kailash, Sahdev, Ryan, future hires) one shared place to track all actions across the three buckets
- Make status updates fast enough that people actually do them (not a chore)
- Make overdue and at-risk items immediately visible without anyone having to ask
- Support both a high-level dashboard view (for leadership updates) and a detailed working view (for day-to-day use)
- Be accessible to each team member via their own login, on any device
- Cost nothing or close to nothing to run at this team size

## 3.1 Non-Goals (Out of Scope for V1)

- Not a full project management tool (no Gantt charts, no dependencies between tasks, no time tracking)
- Not a replacement for the AE CRM, the Digital Sales Room, or the AE Dashboard — those are separate DSC deliverables
- No email or Slack notifications in V1 (may be considered for V2)
- No mobile app — a responsive web app is sufficient
- No client-facing or AE-facing access — this is an internal DSC team tool only

---

## 4. Users & Roles

| Role | Who (initially) | Permissions |
|---|---|---|
| **Admin** | Davis | Full access — create/edit/delete any action, manage users, edit bucket/owner lists |
| **Member** | Vivek, Kailash, Sahdev, Ryan, future hires | Create/edit actions, update status on any action (not just their own), cannot delete actions or manage users |

There is no "view-only" role in V1 — everyone with an account can edit. This is intentional: the team is small and trust-based, and adding granular permissions now would slow the build without real benefit at this scale.

---

## 5. Core Features (V1)

### 5.1 Authentication
- Email + password login (via Supabase Auth)
- No public signup — Admin creates accounts for team members
- Each user has a name and is linked to the "Owner" field used across actions

### 5.2 Dashboard View
A single landing page showing, at a glance:
- Total actions, broken down by status (Not Started / In Progress / Blocked / Done)
- Overdue count — any action past its due date that isn't Done
- Progress by Bucket (3 buckets, % complete each)
- Progress by Month (June / July / future months)
- Progress by Owner (who has how many open items)

This mirrors the existing Excel Dashboard tab, but live and shared.

### 5.3 Action Board — Two Views, Toggleable
**Kanban view**
- Columns: Not Started, In Progress, Blocked, Done
- Each action is a card showing: action title, bucket (color-coded), owner(s), due date, priority
- Drag and drop a card between columns to update status
- Overdue cards show a visible red indicator regardless of column

**Table view**
- Sortable, filterable table — same data as Kanban, in spreadsheet-like rows
- Columns: Month, Action, Bucket, Owner(s), Due Date, Status, % Complete, Priority, Notes
- Filterable by Bucket, Month, Owner, Status, Priority
- Clicking a row opens the action detail/edit panel

### 5.4 Action Detail / Edit
- Click any action (from either view) to open a panel/modal with all fields editable
- Fields: Month, Action title, Bucket, Owner(s) (multi-select from team members), Due Date, Status, % Complete, Priority, Notes
- Changes save immediately (no separate "save" step required, or a clear save button — implementation detail for build phase)

### 5.5 Add New Action
- A clearly visible "+ Add Action" button from both Dashboard and Board views
- Opens the same field set as the edit panel, blank
- New actions default to Status = "Not Started", % Complete = 0

### 5.6 Bucket-Filtered Views
- From the Table view, one-click filter to show only Bucket 01, 02, or 03
- Useful for sharing a focused view (e.g. "show me only outreach actions") without needing separate pages

### 5.7 Basic User Management (Admin only)
- Admin can add a new team member (name + email, triggers Supabase invite or manual password)
- Admin can deactivate a user (e.g. if someone leaves)

---

## 6. Out-of-the-Box Data (Seed Data)

The app should ship with the 19 actions currently in the June + July workplan pre-loaded, so the team can start using it immediately rather than re-entering everything. This data is in the existing Excel tracker and should be migrated in as the initial dataset.

Bucket names, owners, and the structure should match what's already established:
- **Buckets:** Bucket 01 - AE Engagement, Bucket 02 - Client Outreach, Bucket 03 - Content & Assets
- **Owners:** Vivek, Davis, Kailash, Sahdev, Ryan
- **Status options:** Not Started, In Progress, Blocked, Done
- **Priority options:** Critical, High, Medium, Low

---

## 7. Success Criteria for V1

- All 5 current team members can log in and see the same live data
- Updating a status takes under 10 seconds (click/drag, not a multi-step form)
- The Dashboard accurately reflects live data with no manual refresh needed beyond a page reload
- Hosting costs $0/month at this usage level
- Davis can demo this to Vivek/CEO without anything breaking or looking unfinished

---

## 8. Future Considerations (V2+, Not Now)

- Slack or email notifications when an action becomes overdue or is reassigned
- Activity log / audit trail (who changed what, when)
- File attachments on actions (e.g. attach a draft case study to its action)
- Recurring actions (e.g. monthly newsletter, recurring check-ins)
- Role-based view restrictions if the team grows significantly
- Integration with the AE Dashboard or CRM once those are built

---

## 9. Open Questions for Davis to Confirm Before Build

- Should % Complete be a manual number, or auto-derive from Status (e.g. Done = 100%, Not Started = 0%, In Progress = user-entered)?
- Should there be an "Archive" for old completed actions, or do Done items just stay visible permanently?
- Is a single shared workspace sufficient, or will this eventually need to support multiple "projects" beyond just DSC June/July?
