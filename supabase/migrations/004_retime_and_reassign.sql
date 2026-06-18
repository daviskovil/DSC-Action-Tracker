-- ── Migration 004: Retime June actions + assign pending-hire actions to roles ──
--
-- KEEP June 30 due date:
--   • The 3 hiring actions (Hire AI Lead, Hire RevOps Lead, Hire Content Manager)
--   • AE Dashboard actions (wireframe + utility tools definition)
--
-- PUSH to July (month + due date):
--   • All other June actions, due date set by priority:
--       Critical → Jul 7  |  High → Jul 14  |  Medium → Jul 21  |  Low → Jul 28
--
-- REASSIGN pending-hire actions to the role being hired for:
--   • Outreach platform + sequences → 'RevOps Lead'
--   • Asset library + newsletter    → 'Content Manager'
-- ──────────────────────────────────────────────────────────────────────────────


-- ── Step 1: Standardise the 5 "keep in June" actions to Jun 30 ───────────────

update public.actions
set due_date   = '2026-06-30',
    updated_at = now()
where month = 'June'
  and (
    title ilike 'Hire %'
    or title ilike '%AE Dashboard%'
  );


-- ── Step 2: Push all remaining June actions into July ────────────────────────
--   Due date is assigned by priority; month label changes to 'July'.

update public.actions
set month      = 'July',
    due_date   = case priority
                   when 'Critical' then '2026-07-07'
                   when 'High'     then '2026-07-14'
                   when 'Medium'   then '2026-07-21'
                   when 'Low'      then '2026-07-28'
                   else                 '2026-07-31'
                 end,
    updated_at = now()
where month = 'June'
  and title not ilike 'Hire %'
  and title not ilike '%AE Dashboard%';


-- ── Step 3: Reassign pending-hire actions to role placeholders ───────────────

-- Outreach platform selection → RevOps Lead (currently Davis)
update public.actions
set owners     = array['RevOps Lead'],
    notes      = coalesce(notes || ' ', '') || '(Reassign to RevOps Lead on hire)',
    updated_at = now()
where title ilike '%Select and activate outreach platform%';

-- LinkedIn outreach sequence → RevOps Lead
update public.actions
set owners     = array['RevOps Lead'],
    notes      = coalesce(notes || ' ', '') || '(Reassign to RevOps Lead on hire)',
    updated_at = now()
where title ilike '%LinkedIn outreach sequence%'
  and 'Davis' = any(owners);

-- Email outreach sequence → RevOps Lead
update public.actions
set owners     = array['RevOps Lead'],
    notes      = coalesce(notes || ' ', '') || '(Reassign to RevOps Lead on hire)',
    updated_at = now()
where title ilike '%email outreach sequence%'
  and 'Davis' = any(owners);

-- Asset library curation → Content Manager
update public.actions
set owners     = array['Content Manager'],
    notes      = coalesce(notes || ' ', '') || '(Reassign to Content Manager on hire)',
    updated_at = now()
where title ilike '%asset library%';

-- Newsletter outline → Content Manager
update public.actions
set owners     = array['Content Manager'],
    notes      = coalesce(notes || ' ', '') || '(Reassign to Content Manager on hire)',
    updated_at = now()
where title ilike '%Integration Insight%'
  and month = 'July';

-- First AE case study draft → Content Manager (was Davis)
update public.actions
set owners     = array['Content Manager'],
    notes      = coalesce(notes || ' ', '') || '(Reassign to Content Manager on hire)',
    updated_at = now()
where title ilike '%case study%'
  and month = 'July'
  and owners = array['Davis'];

-- Verticals shortlist for pitch decks → Content Manager
update public.actions
set owners     = array['Content Manager'],
    notes      = coalesce(notes || ' ', '') || '(Reassign to Content Manager on hire)',
    updated_at = now()
where title ilike '%verticals for pitch deck%';
