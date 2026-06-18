-- Allow all authenticated users to delete actions (not just admins)
-- Board is fully open to all team members; admin privilege is only for user management.

drop policy if exists "actions_admin_delete" on public.actions;

create policy "actions_delete" on public.actions
  for delete to authenticated using (true);

-- Fix seed data: rename 'Ryan' to 'Raghuram' in owners arrays
update public.actions
  set owners = array_replace(owners, 'Ryan', 'Raghuram'),
      updated_at = now()
  where 'Ryan' = any(owners);
