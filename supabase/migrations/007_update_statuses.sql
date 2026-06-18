-- Migrate old status values to new schema
-- Done stays Done
-- Not Started → Pending
-- In Progress → InProgress
-- Blocked → Dependency

update public.actions set status = 'Pending'    where status = 'Not Started';
update public.actions set status = 'InProgress' where status = 'In Progress';
update public.actions set status = 'Dependency' where status = 'Blocked';
