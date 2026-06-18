# Software Requirements Specification (SRS)
## DSC Action Tracker — Web Application

**Version:** 1.0
**Companion to:** PRD_DSC_Action_Tracker.md
**Intended for:** Build via Claude Code
**Date:** June 2026

---

## 1. System Overview

A single-tenant web application for the DataSkate Sales Support Center (DSC) team to track actions across three workstream buckets. Built as a Next.js application, hosted on Vercel, with Supabase providing Postgres database, authentication, and row-level data access.

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend Framework | Next.js (App Router) | React-based, deploys natively to Vercel |
| Styling | Tailwind CSS | Fast to build with, no design system overhead needed |
| Database | Supabase (Postgres) | Free tier sufficient for this scale |
| Authentication | Supabase Auth | Email/password, no public signup |
| Hosting | Vercel | Free tier, auto-deploy from GitHub |
| Drag & Drop (Kanban) | dnd-kit | Actively maintained drag-and-drop library |
| Date handling | date-fns | Lightweight, avoid moment.js |
| Forms | React Hook Form (optional) | Or plain controlled components — implementation choice |

No paid services are required at the expected usage level (5-10 users, low hundreds of records).

---

## 3. Data Model

### 3.1 Table: users
Managed primarily by Supabase Auth, with a linked profile table for app-specific fields.

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Matches Supabase Auth user id |
| name | text | Display name, e.g. "Davis" |
| email | text | |
| role | text | admin or member |
| active | boolean | default true |
| created_at | timestamptz | default now() |

### 3.2 Table: actions

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| month | text | e.g. "June", "July" |
| title | text | the action description |
| bucket | text | one of the 3 bucket values, see 3.4 |
| owners | text[] | array of names |
| due_date | date | nullable |
| status | text | one of: Not Started / In Progress / Blocked / Done |
| percent_complete | integer | 0-100 |
| priority | text | one of: Critical / High / Medium / Low |
| notes | text | nullable, free text |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | auto-update on row change via trigger |
| created_by | uuid (FK to users.id) | |

### 3.3 Owners — Implementation Note
V1 may use a simple text[] column for owners (array of names) for speed of build. If multi-owner filtering/reporting becomes important later, refactor to a join table (action_owners with action_id, user_id). Not required for V1.

### 3.4 Constrained Value Lists
These should be enforced at the application layer (dropdowns) and ideally also as Postgres CHECK constraints or an enum type, to prevent bad data:

- Bucket: "Bucket 01 - AE Engagement", "Bucket 02 - Client Outreach", "Bucket 03 - Content & Assets"
- Status: "Not Started", "In Progress", "Blocked", "Done"
- Priority: "Critical", "High", "Medium", "Low"
- Month: free text is acceptable (so future months can be added without a schema change), but the UI should offer a dropdown pre-populated with June, July, and allow free entry for future months

### 3.5 Row-Level Security (Supabase RLS)
- All authenticated users can SELECT all rows in actions (shared visibility)
- All authenticated users can INSERT and UPDATE rows in actions
- Only users where role = admin can DELETE rows in actions or modify the users table
- No anonymous/public access to any table

---

## 4. Functional Requirements

### FR-1: Authentication
- FR-1.1: Users log in via email + password (Supabase Auth)
- FR-1.2: No self-service signup page exists or is publicly linked
- FR-1.3: Admin can create new user accounts (via Supabase dashboard initially is acceptable for V1; an in-app "Add User" admin screen is a nice-to-have, not required for launch)
- FR-1.4: Unauthenticated users are redirected to the login page from any route

### FR-2: Dashboard
- FR-2.1: Display total action count
- FR-2.2: Display count per status (Not Started, In Progress, Blocked, Done)
- FR-2.3: Display overdue count, calculated as due_date < today AND status != Done
- FR-2.4: Display % complete per bucket, calculated as (count where status=Done in bucket) / (total in bucket)
- FR-2.5: Display % complete per month, calculated the same way
- FR-2.6: Display open item count per owner
- FR-2.7: All dashboard figures must reflect live data on page load (no caching delay beyond standard page load)

### FR-3: Kanban Board View
- FR-3.1: Render 4 columns corresponding to the 4 status values
- FR-3.2: Each action renders as a card showing: title, bucket (with a distinct color per bucket), owner(s), due date, priority
- FR-3.3: Cards for overdue actions show a visible red marker, independent of which column they're in
- FR-3.4: Dragging a card to a different column updates that action's status field immediately (optimistic UI update, then persisted to Supabase)
- FR-3.5: Board supports filtering by Bucket, Owner, and Priority (filters apply to which cards are shown, not which columns exist)

### FR-4: Table View
- FR-4.1: Render all actions as rows in a table with columns: Month, Action, Bucket, Owner(s), Due Date, Status, % Complete, Priority, Notes
- FR-4.2: Table is sortable by clicking any column header
- FR-4.3: Table supports filtering by Bucket, Month, Owner, Status, and Priority (multi-select filters, combinable)
- FR-4.4: Clicking a row opens the Action Detail panel for that row
- FR-4.5: Overdue rows are visually flagged (e.g. red text or red left-border on the row)

### FR-5: View Toggle
- FR-5.1: A persistent control (e.g. tab or toggle button) lets the user switch between Kanban and Table views without losing applied filters

### FR-6: Action Detail / Edit Panel
- FR-6.1: Opens as a modal or side panel (implementation choice) showing all fields for the selected action, editable
- FR-6.2: Owner field is a multi-select populated from the active users list
- FR-6.3: Bucket, Status, Priority fields are dropdowns constrained to the value lists in section 3.4
- FR-6.4: Due Date field is a date picker
- FR-6.5: Saving updates the record in Supabase and reflects immediately in both Kanban and Table views
- FR-6.6: Closing the panel without changes does not create unnecessary writes

### FR-7: Add New Action
- FR-7.1: A visible "+ Add Action" control is present on both Dashboard and Board/Table views
- FR-7.2: Opens the same field set as the Edit panel, with all fields blank except Status (defaults to Not Started) and % Complete (defaults to 0)
- FR-7.3: On save, the new action appears immediately in both views

### FR-8: Bucket Filter Shortcut
- FR-8.1: From the Table view, one-click controls exist to filter to a single bucket (e.g. three buttons/tabs: Bucket 01, Bucket 02, Bucket 03, All)

### FR-9: Admin User Management
- FR-9.1: Admin-role users see an additional Team or Users section
- FR-9.2: Admin can view a list of all users and their role (admin/member) and active status
- FR-9.3: Admin can deactivate a user (sets active = false; does not delete their historical data or past actions)
- FR-9.4: Creating new users may be handled via the Supabase dashboard directly for V1 rather than building a full in-app flow — acceptable shortcut, not a strict requirement

---

## 5. Non-Functional Requirements

### NFR-1: Performance
Initial page load should be under 2 seconds on a standard broadband connection, given the small data volume expected (low hundreds of rows max).

### NFR-2: Responsiveness
The app must be usable on a laptop browser and on a mobile browser (responsive layout). A dedicated mobile app is explicitly out of scope.

### NFR-3: Cost
The application must run entirely within the free tiers of Vercel and Supabase at the expected usage level (5-10 users, fewer than 1,000 total action records). No paid add-ons should be required for V1.

### NFR-4: Data Integrity
Status, Bucket, and Priority fields must be constrained to their defined value lists at the database level (not relying solely on frontend validation) to prevent inconsistent data from manual API calls or future integrations.

### NFR-5: Security
No table should be publicly readable or writable without authentication. Passwords are handled entirely by Supabase Auth — the application never stores or handles raw passwords.

### NFR-6: Browser Support
Must work correctly on current versions of Chrome, Safari, and Edge. No requirement to support Internet Explorer or legacy browsers.

---

## 6. Migration of Existing Data

The current Excel-based tracker contains 19 seed actions across the 3 buckets for June and July. These should be inserted into the actions table as part of initial setup, either via a one-time SQL seed script run against Supabase, or a simple CSV import using Supabase's table import feature.

Field mapping from the existing Excel file:

| Excel Column | Maps to DB Column |
|---|---|
| Month | month |
| Action | title |
| Bucket | bucket |
| Owner(s) | owners |
| Due Date | due_date |
| Status | status |
| % Complete | percent_complete |
| Priority | priority |
| Notes | notes |

---

## 7. Deployment Notes

- Repository hosted on GitHub (already available per team setup)
- Vercel project connected to the GitHub repo, auto-deploys on push to main
- Environment variables required in Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (and a service-role key only if any server-side admin actions are implemented — keep this server-side only, never expose to the client)
- Supabase project created separately; database schema (tables, RLS policies) should be captured as a SQL migration file checked into the repo (e.g. /supabase/migrations/) so the schema is reproducible, not just clicked together in the dashboard

---

## 8. Acceptance Checklist (for build verification)

- [ ] User can log in with a Supabase-created account
- [ ] Dashboard loads and shows correct live counts matching the underlying data
- [ ] Kanban view renders all actions in the correct status columns
- [ ] Dragging a card between columns updates status and persists after page refresh
- [ ] Table view renders all actions, sortable and filterable
- [ ] Clicking a row or card opens an editable detail panel
- [ ] Saving an edit reflects immediately in both views
- [ ] New action can be added and appears in both views
- [ ] Bucket filter shortcuts correctly narrow the Table view
- [ ] Non-admin users cannot delete actions or access user management
- [ ] App is usable on a mobile browser viewport
- [ ] No console errors on any core page
- [ ] App is deployed and reachable via a public Vercel URL, gated behind login
