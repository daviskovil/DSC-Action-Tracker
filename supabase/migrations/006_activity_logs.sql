-- ── Migration 006: Activity Logs ─────────────────────────────────────────────
create table if not exists public.activity_logs (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete set null,
  user_name   text not null default 'Unknown',
  action_type text not null,   -- 'login' | 'action_created' | 'action_updated' | 'action_deleted'
  description text not null,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- Index for fast queries by date and user
create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at desc);
create index if not exists activity_logs_user_id_idx    on public.activity_logs(user_id);

-- RLS: authenticated users can insert their own logs; only admins can read all
alter table public.activity_logs enable row level security;

create policy "activity_logs_insert" on public.activity_logs
  for insert to authenticated with check (true);

create policy "activity_logs_select" on public.activity_logs
  for select to authenticated using (true);
