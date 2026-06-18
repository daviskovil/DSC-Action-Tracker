-- Drop the old bucket check constraint and recreate with DSC Operations added
alter table public.actions drop constraint if exists actions_bucket_check;

alter table public.actions
  add constraint actions_bucket_check
  check (bucket in (
    'Bucket 01 - AE Engagement',
    'Bucket 02 - Client Outreach',
    'Bucket 03 - Content & Assets',
    'Bucket 04 - DSC Operations'
  ));
