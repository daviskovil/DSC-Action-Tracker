-- ── Migration 003: Replace sample data with full DSC Action List (52 actions) ──
-- Source: DSC_Full_Action_List.md
-- Workstream mapping:
--   AE Engagement & Credibility       → Bucket 01 - AE Engagement
--   Client Outreach & Lead Generation → Bucket 02 - Client Outreach
--   Content Management & Distribution → Bucket 03 - Content & Assets
-- Owner note: "Ryan" in source → "Raghuram" (US Onsite Sales Lead)
-- "(pending hire)" annotations stripped; Davis remains interim owner
-- All actions start as Not Started / 0% — update as work progresses

truncate table public.actions restart identity cascade;

insert into public.actions
  (month, title, bucket, owners, due_date, status, percent_complete, priority, notes)
values

-- ══════════════════════════════════════════════════════════
-- JUNE — Workstream 01: AE Engagement & Credibility
-- ══════════════════════════════════════════════════════════

('June',
 'Kailash to deliver list of 100 target AEs + owned accounts',
 'Bucket 01 - AE Engagement',
 array['Kailash'],
 '2026-06-10', 'Not Started', 0, 'Critical',
 'Blocks AE persona work, CRM setup, and Field Agent prep'),

('June',
 'Build AE relationship CRM structure (fields: last contact, tier, deals referred, status)',
 'Bucket 01 - AE Engagement',
 array['Davis'],
 '2026-06-16', 'Not Started', 0, 'High',
 null),

('June',
 'Build AE persona template (professional profile, goals, psychology, career stage)',
 'Bucket 01 - AE Engagement',
 array['Davis'],
 '2026-06-13', 'Not Started', 0, 'High',
 null),

('June',
 'Complete first 10 AE persona profiles as pilot batch',
 'Bucket 01 - AE Engagement',
 array['Davis'],
 '2026-06-18', 'Not Started', 0, 'High',
 'For Raghuram/Kailash to test before scaling to 100'),

('June',
 'Segment the 100 AE list by city, tier, and engagement status',
 'Bucket 01 - AE Engagement',
 array['Davis'],
 '2026-06-18', 'Not Started', 0, 'Medium',
 null),

('June',
 'Set up weekly AE check-in cadence and invite template',
 'Bucket 01 - AE Engagement',
 array['Davis'],
 '2026-06-20', 'Not Started', 0, 'Medium',
 null),

('June',
 'Draft internal referral ask script for existing 30 AEs',
 'Bucket 01 - AE Engagement',
 array['Kailash'],
 '2026-06-20', 'Not Started', 0, 'Medium',
 '"Can you introduce me to 2-3 colleagues" — draft the intro message for them'),

('June',
 'Identify and schedule first round of office visits / Lunch & Learns (Chicago)',
 'Bucket 01 - AE Engagement',
 array['Kailash'],
 '2026-06-25', 'Not Started', 0, 'High',
 'Time around team standups and QBRs'),

('June',
 'Scale AE persona profiles to 50 completed',
 'Bucket 01 - AE Engagement',
 array['Davis'],
 '2026-06-27', 'Not Started', 0, 'Medium',
 null),

('June',
 'Draft AE Dashboard wireframe (account status, outreach view, Red/Yellow/Green)',
 'Bucket 01 - AE Engagement',
 array['Davis'],
 '2026-06-16', 'Not Started', 0, 'High',
 null),

('June',
 'Define AE Dashboard utility tools for V1 (LinkedIn→email/phone lookup priority)',
 'Bucket 01 - AE Engagement',
 array['Davis'],
 '2026-06-18', 'Not Started', 0, 'Medium',
 null),

-- ══════════════════════════════════════════════════════════
-- JUNE — Workstream 02: Client Outreach & Lead Generation
-- ══════════════════════════════════════════════════════════

('June',
 'Hire AI & Automation Lead (Offshore)',
 'Bucket 02 - Client Outreach',
 array['Davis'],
 '2026-06-13', 'Not Started', 0, 'Critical',
 null),

('June',
 'Hire Outreach/RevOps Lead (Offshore)',
 'Bucket 02 - Client Outreach',
 array['Davis'],
 '2026-06-13', 'Not Started', 0, 'Critical',
 null),

('June',
 'Begin email domain warm-up',
 'Bucket 02 - Client Outreach',
 array['Davis'],
 '2026-06-09', 'Not Started', 0, 'Critical',
 'Takes 2-3 weeks minimum — cannot be delayed, start day one'),

('June',
 'Select and activate outreach platforms (Instantly / Lemlist / HeyReach)',
 'Bucket 02 - Client Outreach',
 array['Davis'],
 '2026-06-13', 'Not Started', 0, 'High',
 'Reassign to Outreach/RevOps Lead once hired'),

('June',
 'Produce DSC Platform PRD document',
 'Bucket 02 - Client Outreach',
 array['Davis','Vivek'],
 '2026-06-13', 'Not Started', 0, 'High',
 null),

('June',
 'Begin DSC Platform build (automation logic: list intake → segment → sequence → campaign)',
 'Bucket 02 - Client Outreach',
 array['Vivek'],
 '2026-06-20', 'Not Started', 0, 'High',
 null),

('June',
 'Define notification & visibility requirements for outreach automation',
 'Bucket 02 - Client Outreach',
 array['Davis'],
 '2026-06-16', 'Not Started', 0, 'Medium',
 'What does the AE see, when, in what format'),

('June',
 'Draft 24-hour turnaround SLA and share with team',
 'Bucket 02 - Client Outreach',
 array['Davis'],
 '2026-06-20', 'Not Started', 0, 'Critical',
 'Core DSC value proof point — must be airtight before July'),

('June',
 'Build LinkedIn outreach sequence (5-touch)',
 'Bucket 02 - Client Outreach',
 array['Davis'],
 '2026-06-27', 'Not Started', 0, 'High',
 'Reassign to Outreach/RevOps Lead once hired'),

('June',
 'Build email outreach sequence (3-touch)',
 'Bucket 02 - Client Outreach',
 array['Davis'],
 '2026-06-27', 'Not Started', 0, 'High',
 'Reassign to Outreach/RevOps Lead once hired'),

('June',
 'End-to-end test of automation pipeline with dummy prospect list',
 'Bucket 02 - Client Outreach',
 array['Vivek'],
 '2026-06-27', 'Not Started', 0, 'Critical',
 'Validate 24hr turnaround before go-live'),

('June',
 'Define lost-deal lead card structure (pain point, budget signal, tech stack, reason for drop)',
 'Bucket 02 - Client Outreach',
 array['Davis'],
 '2026-06-20', 'Not Started', 0, 'Medium',
 'Feeds Kovil AI handoff process'),

('June',
 'Set up CRM integration between outreach platforms and AE Dashboard',
 'Bucket 02 - Client Outreach',
 array['Vivek'],
 '2026-06-27', 'Not Started', 0, 'Medium',
 null),

-- ══════════════════════════════════════════════════════════
-- JUNE — Workstream 03: Content Management & Distribution
-- ══════════════════════════════════════════════════════════

('June',
 'Hire Content Manager (Offshore)',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-06-13', 'Not Started', 0, 'High',
 null),

('June',
 'Set up Digital Sales Room infrastructure (tool + template)',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-06-25', 'Not Started', 0, 'Critical',
 null),

('June',
 'Curate initial asset library: decks, one-pagers, battlecards',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-06-30', 'Not Started', 0, 'Medium',
 'Reassign to Content Manager once hired'),

('June',
 'Draft first AE-formatted case study from a past implementation',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-06-30', 'Not Started', 0, 'Medium',
 'Hero is the AE''s referral decision, not DataSkate'),

('June',
 'Draft outline for monthly "Integration Insight" newsletter',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-06-27', 'Not Started', 0, 'Low',
 'Reassign to Content Manager once hired'),

('June',
 'Identify and shortlist verticals for pitch deck customization (logistics, fintech, healthcare, retail)',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-06-30', 'Not Started', 0, 'Low',
 null),

-- ══════════════════════════════════════════════════════════
-- JULY — Workstream 01: AE Engagement & Credibility
-- ══════════════════════════════════════════════════════════

('July',
 'Chicago Field Agent begins AE office visits and Lunch & Learns',
 'Bucket 01 - AE Engagement',
 array['Kailash'],
 '2026-07-07', 'Not Started', 0, 'High',
 null),

('July',
 'AE Dashboard V1 live and used in first AE field meetings',
 'Bucket 01 - AE Engagement',
 array['Vivek','Davis'],
 '2026-07-07', 'Not Started', 0, 'Critical',
 null),

('July',
 'Begin AE persona profiles rollout — first 20 completed',
 'Bucket 01 - AE Engagement',
 array['Davis'],
 '2026-07-31', 'Not Started', 0, 'Medium',
 null),

('July',
 'Run first internal referral ask round with engaged AEs',
 'Bucket 01 - AE Engagement',
 array['Kailash'],
 '2026-07-14', 'Not Started', 0, 'High',
 'Target: 2-3 introductions per engaged AE'),

('July',
 'Send first round of post-call deal intelligence briefs to AEs',
 'Bucket 01 - AE Engagement',
 array['Kailash'],
 '2026-07-14', 'Not Started', 0, 'Medium',
 '3-bullet summary same day as discovery call'),

('July',
 'Track and log AE engagement weekly (CRM updates after every interaction)',
 'Bucket 01 - AE Engagement',
 array['Kailash'],
 '2026-07-31', 'Not Started', 0, 'Medium',
 'Ongoing through the month'),

('July',
 'Identify first 5 AEs for "Partner Circle" pilot concept',
 'Bucket 01 - AE Engagement',
 array['Davis','Kailash'],
 '2026-07-21', 'Not Started', 0, 'Low',
 'Priority response, co-marketing — concept validation before formal launch'),

('July',
 'Begin building offshore pre-sales team structure under Kailash',
 'Bucket 01 - AE Engagement',
 array['Kailash'],
 '2026-07-31', 'Not Started', 0, 'Medium',
 'Per leadership RACI — Kailash accountable for build'),

-- ══════════════════════════════════════════════════════════
-- JULY — Workstream 02: Client Outreach & Lead Generation
-- ══════════════════════════════════════════════════════════

('July',
 'Outreach/RevOps Lead activates email and LinkedIn campaigns',
 'Bucket 02 - Client Outreach',
 array['Sahdev','Davis'],
 '2026-07-07', 'Not Started', 0, 'Critical',
 null),

('July',
 'First prospect lists collected from AEs — demonstrate 24hr turnaround live',
 'Bucket 02 - Client Outreach',
 array['Kailash','Raghuram'],
 '2026-07-14', 'Not Started', 0, 'Critical',
 'Core DSC value proof point'),

('July',
 'Monitor and report weekly on outreach activity & response rates',
 'Bucket 02 - Client Outreach',
 array['Sahdev'],
 '2026-07-31', 'Not Started', 0, 'High',
 'Ongoing weekly cadence'),

('July',
 'Log first 10 Kovil AI lead cards from dropped discovery calls',
 'Bucket 02 - Client Outreach',
 array['Kailash'],
 '2026-07-21', 'Not Started', 0, 'Medium',
 null),

('July',
 'Flag and track 30-day wait period for Kovil AI handoff on logged leads',
 'Bucket 02 - Client Outreach',
 array['Sahdev'],
 '2026-07-31', 'Not Started', 0, 'Medium',
 'Avoid any perception of poaching from MuleSoft pipeline'),

('July',
 'Brief Kovil AI team with first batch of warm lead context',
 'Bucket 02 - Client Outreach',
 array['Sahdev'],
 '2026-07-28', 'Not Started', 0, 'Medium',
 null),

('July',
 'Review and optimize outreach sequences based on first 2 weeks of data',
 'Bucket 02 - Client Outreach',
 array['Sahdev'],
 '2026-07-21', 'Not Started', 0, 'Medium',
 'Open/reply rate review'),

('July',
 'Set up referral fee tracking for Kovil AI conversions',
 'Bucket 02 - Client Outreach',
 array['Davis'],
 '2026-07-21', 'Not Started', 0, 'Low',
 null),

-- ══════════════════════════════════════════════════════════
-- JULY — Workstream 03: Content Management & Distribution
-- ══════════════════════════════════════════════════════════

('July',
 'Content Manager produces first 3 AE-formatted case studies',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-07-21', 'Not Started', 0, 'Medium',
 null),

('July',
 'First Integration Insight newsletter drafted and sent to AEs',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-07-14', 'Not Started', 0, 'Medium',
 null),

('July',
 'Digital Sales Room fully populated and accessible to all engaged AEs',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-07-14', 'Not Started', 0, 'High',
 null),

('July',
 'Produce first one-page win brief for a completed implementation go-live',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-07-28', 'Not Started', 0, 'Low',
 'Ready for AE to share with their manager'),

('July',
 'Draft first vertical-specific pitch deck (highest-priority industry)',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-07-31', 'Not Started', 0, 'Low',
 null),

('July',
 'Set cadence for ongoing Digital Sales Room updates (weekly)',
 'Bucket 03 - Content & Assets',
 array['Davis'],
 '2026-07-14', 'Not Started', 0, 'Low',
 null);
