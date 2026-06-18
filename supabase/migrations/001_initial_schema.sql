-- ============================================================
-- DSC Action Tracker — Initial Schema
-- ============================================================

-- ── Users (mirrors Supabase Auth) ───────────────────────────
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  role        text not null default 'member' check (role in ('admin', 'member')),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Actions ─────────────────────────────────────────────────
create table if not exists public.actions (
  id                uuid primary key default gen_random_uuid(),
  month             text not null,
  title             text not null,
  bucket            text not null check (bucket in (
                      'Bucket 01 - AE Engagement',
                      'Bucket 02 - Client Outreach',
                      'Bucket 03 - Content & Assets'
                    )),
  owners            text[] not null default '{}',
  due_date          date,
  status            text not null default 'Not Started' check (status in (
                      'Not Started', 'In Progress', 'Blocked', 'Done'
                    )),
  percent_complete  integer not null default 0 check (percent_complete between 0 and 100),
  priority          text not null default 'Medium' check (priority in (
                      'Critical', 'High', 'Medium', 'Low'
                    )),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references public.users(id)
);

-- ── Auto-update updated_at ───────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger actions_updated_at
  before update on public.actions
  for each row execute function public.set_updated_at();

-- ── Row-Level Security ───────────────────────────────────────
alter table public.users  enable row level security;
alter table public.actions enable row level security;

-- users: authenticated users can read all; only admin can write
create policy "users_select" on public.users
  for select to authenticated using (true);

create policy "users_admin_insert" on public.users
  for insert to authenticated
  with check (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "users_admin_update" on public.users
  for update to authenticated
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- actions: authenticated users can read/insert/update; only admin can delete
create policy "actions_select" on public.actions
  for select to authenticated using (true);

create policy "actions_insert" on public.actions
  for insert to authenticated with check (true);

create policy "actions_update" on public.actions
  for update to authenticated using (true);

create policy "actions_admin_delete" on public.actions
  for delete to authenticated
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

-- ── Seed Data — 19 June/July actions ────────────────────────
insert into public.actions (month, title, bucket, owners, due_date, status, percent_complete, priority, notes)
values
  -- Bucket 01 - AE Engagement
  ('June',  'Map existing 30 AE relationships and identify gaps to reach 100',     'Bucket 01 - AE Engagement', array['Davis','Vivek'],   '2026-06-30', 'In Progress', 40, 'High',     null),
  ('June',  'Create AE persona profiles for top 10 target AEs',                    'Bucket 01 - AE Engagement', array['Kailash'],          '2026-06-28', 'Not Started', 0,  'High',     null),
  ('June',  'Set up weekly AE check-in cadence and invite template',               'Bucket 01 - AE Engagement', array['Davis'],            '2026-06-25', 'In Progress', 60, 'Critical', null),
  ('June',  'Build AE credibility deck (DataSkate + MuleSoft wins)',               'Bucket 01 - AE Engagement', array['Vivek','Kailash'],  '2026-06-30', 'Not Started', 0,  'High',     'Use Q1 case studies as base'),
  ('July',  'Expand AE coverage from 30 to 60 (first half of July goal)',          'Bucket 01 - AE Engagement', array['Davis','Ryan'],     '2026-07-15', 'Not Started', 0,  'Critical', null),
  ('July',  'Host first AE enablement session (virtual)',                           'Bucket 01 - AE Engagement', array['Davis','Vivek'],   '2026-07-22', 'Not Started', 0,  'High',     null),
  ('July',  'Track AE engagement scores in AE Dashboard v1',                       'Bucket 01 - AE Engagement', array['Kailash'],          '2026-07-31', 'Not Started', 0,  'Medium',   null),

  -- Bucket 02 - Client Outreach
  ('June',  'Draft 24-hour turnaround SLA and share with team',                    'Bucket 02 - Client Outreach', array['Davis'],          '2026-06-20', 'Done',        100,'Critical', null),
  ('June',  'Build LinkedIn outreach sequence (5-touch)',                           'Bucket 02 - Client Outreach', array['Sahdev'],         '2026-06-27', 'In Progress', 50, 'High',     null),
  ('June',  'Build email outreach sequence (3-touch)',                              'Bucket 02 - Client Outreach', array['Sahdev'],         '2026-06-27', 'In Progress', 30, 'High',     null),
  ('June',  'Identify 50 target accounts for July outreach',                       'Bucket 02 - Client Outreach', array['Vivek','Ryan'],   '2026-06-30', 'Not Started', 0,  'High',     null),
  ('July',  'Launch first outreach wave to 50 target accounts',                    'Bucket 02 - Client Outreach', array['Sahdev','Ryan'],  '2026-07-05', 'Not Started', 0,  'Critical', null),
  ('July',  'Track outreach response rates and log in tracker',                    'Bucket 02 - Client Outreach', array['Sahdev'],         '2026-07-31', 'Not Started', 0,  'Medium',   null),
  ('July',  'Follow up on all non-responses from wave 1 (day 7)',                  'Bucket 02 - Client Outreach', array['Sahdev','Ryan'],  '2026-07-12', 'Not Started', 0,  'High',     null),

  -- Bucket 03 - Content & Assets
  ('June',  'Set up Digital Sales Room infrastructure (tool + template)',           'Bucket 03 - Content & Assets', array['Kailash'],       '2026-06-25', 'In Progress', 70, 'Critical', null),
  ('June',  'Write first case study draft (MuleSoft win)',                          'Bucket 03 - Content & Assets', array['Vivek'],         '2026-06-30', 'Not Started', 0,  'High',     null),
  ('June',  'Curate asset library: decks, one-pagers, battle cards',               'Bucket 03 - Content & Assets', array['Kailash','Vivek'],'2026-06-30','Not Started', 0,  'Medium',   null),
  ('July',  'Publish Digital Sales Room v1 to first 5 AEs',                        'Bucket 03 - Content & Assets', array['Kailash','Davis'],'2026-07-10','Not Started', 0,  'Critical', null),
  ('July',  'Produce second case study and add to DSR',                            'Bucket 03 - Content & Assets', array['Vivek'],         '2026-07-25', 'Not Started', 0,  'High',     null);
