-- Target schema for the Government Tender Intelligence platform.
-- Apply after `supabase init` + `supabase start` (or a hosted project).
-- Do not run this against production by hand.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums (keep in sync with packages/shared)
-- ---------------------------------------------------------------------------
create type public.app_role as enum (
  'super_admin',
  'procurement_officer',
  'evaluator',
  'contractor'
);

create type public.tender_status as enum (
  'draft',
  'published',
  'closed',
  'evaluating',
  'awarded',
  'completed',
  'archived'
);

create type public.bid_status as enum (
  'draft',
  'submitted',
  'withdrawn',
  'under_review',
  'accepted',
  'rejected'
);

create type public.document_kind as enum (
  'specification',
  'addendum',
  'form',
  'supporting',
  'bid_attachment'
);

create type public.ai_review_status as enum (
  'pending',
  'processing',
  'needs_review',
  'approved',
  'corrected'
);

create type public.project_status as enum (
  'not_started',
  'in_progress',
  'delayed',
  'completed'
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Role from profiles (source of truth), not user_metadata.
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security invoker
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  full_name text not null,
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contractors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  company_name text not null,
  registration_number text,
  compliance_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tenders
-- ---------------------------------------------------------------------------
create table public.tenders (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id),
  title text not null,
  description text,
  category text,
  department text,
  budget_cents bigint,
  currency char(3) not null default 'ZAR',
  status public.tender_status not null default 'draft',
  published_at timestamptz,
  closing_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenders_closing_after_publish check (
    closing_at is null or published_at is null or closing_at > published_at
  )
);

create index tenders_status_closing_idx on public.tenders (status, closing_at);
create index tenders_created_by_idx on public.tenders (created_by);

create table public.tender_documents (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id),
  kind public.document_kind not null default 'specification',
  storage_path text not null,
  file_name text not null,
  mime_type text,
  byte_size integer,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create index tender_documents_tender_idx on public.tender_documents (tender_id);

create table public.tender_requirements (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders (id) on delete cascade,
  body text not null,
  mandatory boolean not null default true,
  source text not null default 'human' check (source in ('human', 'ai_approved')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.evaluation_criteria (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders (id) on delete cascade,
  label text not null,
  weight numeric(5, 2) not null default 0 check (weight >= 0),
  source text not null default 'human' check (source in ('human', 'ai_approved')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.tender_documents (id) on delete cascade,
  tender_id uuid not null references public.tenders (id) on delete cascade,
  review_status public.ai_review_status not null default 'pending',
  summary text,
  extracted jsonb not null default '{}'::jsonb,
  model text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_analyses_tender_idx on public.ai_analyses (tender_id, review_status);

-- ---------------------------------------------------------------------------
-- Bids and evaluation
-- ---------------------------------------------------------------------------
create table public.bids (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders (id) on delete restrict,
  contractor_id uuid not null references public.contractors (id) on delete restrict,
  amount_cents bigint,
  status public.bid_status not null default 'draft',
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tender_id, contractor_id)
);

create index bids_tender_idx on public.bids (tender_id);
create index bids_contractor_idx on public.bids (contractor_id);

create table public.bid_documents (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null references public.bids (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table public.bid_requirement_responses (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null references public.bids (id) on delete cascade,
  requirement_id uuid not null references public.tender_requirements (id) on delete cascade,
  response text,
  unique (bid_id, requirement_id)
);

create table public.evaluator_assignments (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders (id) on delete cascade,
  evaluator_id uuid not null references public.profiles (id) on delete cascade,
  assigned_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (tender_id, evaluator_id)
);

create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null references public.bids (id) on delete cascade,
  evaluator_id uuid not null references public.profiles (id),
  score numeric(6, 2),
  comments text,
  compliance_pass boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bid_id, evaluator_id)
);

-- ---------------------------------------------------------------------------
-- Award, project, spend
-- ---------------------------------------------------------------------------
create table public.awards (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null unique references public.tenders (id),
  bid_id uuid not null unique references public.bids (id),
  awarded_by uuid not null references public.profiles (id),
  awarded_at timestamptz not null default now(),
  notes text
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  award_id uuid not null unique references public.awards (id),
  title text not null,
  status public.project_status not null default 'not_started',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  location_label text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expenditure (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  amount_cents bigint not null check (amount_cents >= 0),
  spent_on date not null,
  description text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index expenditure_project_idx on public.expenditure (project_id);

-- ---------------------------------------------------------------------------
-- Notifications and audit
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text,
  kind text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id),
  entity text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity, entity_id);

-- ---------------------------------------------------------------------------
-- Transparency views (anon-safe projection)
-- ---------------------------------------------------------------------------
create view public.awarded_tenders_public
with (security_invoker = true) as
select
  t.id,
  t.title,
  t.category,
  t.department,
  t.budget_cents,
  t.currency,
  a.awarded_at,
  c.company_name as contractor_name,
  p.status as project_status,
  p.progress_percent,
  p.location_label
from public.tenders t
join public.awards a on a.tender_id = t.id
join public.bids b on b.id = a.bid_id
join public.contractors c on c.id = b.contractor_id
left join public.projects p on p.award_id = a.id
where t.status in ('awarded', 'completed');

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger contractors_updated_at before update on public.contractors
for each row execute function public.set_updated_at();

create trigger tenders_updated_at before update on public.tenders
for each row execute function public.set_updated_at();

create trigger ai_analyses_updated_at before update on public.ai_analyses
for each row execute function public.set_updated_at();

create trigger bids_updated_at before update on public.bids
for each row execute function public.set_updated_at();

create trigger evaluations_updated_at before update on public.evaluations
for each row execute function public.set_updated_at();

create trigger projects_updated_at before update on public.projects
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: enable everywhere. Policies are the authorisation model.
-- Tighten predicates as features land; do not ship tables without RLS.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.contractors enable row level security;
alter table public.tenders enable row level security;
alter table public.tender_documents enable row level security;
alter table public.tender_requirements enable row level security;
alter table public.evaluation_criteria enable row level security;
alter table public.ai_analyses enable row level security;
alter table public.bids enable row level security;
alter table public.bid_documents enable row level security;
alter table public.bid_requirement_responses enable row level security;
alter table public.evaluator_assignments enable row level security;
alter table public.evaluations enable row level security;
alter table public.awards enable row level security;
alter table public.projects enable row level security;
alter table public.expenditure enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: users read self; staff read staff; super_admin writes roles.
create policy profiles_select_self on public.profiles
for select to authenticated
using (id = (select auth.uid()) or public.current_app_role() in ('super_admin', 'procurement_officer', 'evaluator'));

create policy profiles_update_self on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = public.current_app_role());

-- Tenders: staff manage; contractors see published+; anon uses awarded_tenders_public.
create policy tenders_staff_all on public.tenders
for all to authenticated
using (public.current_app_role() in ('super_admin', 'procurement_officer', 'evaluator'))
with check (public.current_app_role() in ('super_admin', 'procurement_officer'));

create policy tenders_contractor_select on public.tenders
for select to authenticated
using (
  public.current_app_role() = 'contractor'
  and status in ('published', 'closed', 'evaluating', 'awarded', 'completed')
);

-- Bids: contractor owns own rows; assigned evaluators and officers read.
create policy bids_contractor_own on public.bids
for all to authenticated
using (
  public.current_app_role() = 'contractor'
  and contractor_id in (
    select c.id from public.contractors c where c.profile_id = (select auth.uid())
  )
)
with check (
  public.current_app_role() = 'contractor'
  and contractor_id in (
    select c.id from public.contractors c where c.profile_id = (select auth.uid())
  )
);

create policy bids_staff_select on public.bids
for select to authenticated
using (public.current_app_role() in ('super_admin', 'procurement_officer', 'evaluator'));

-- Notifications: recipient only.
create policy notifications_own on public.notifications
for select to authenticated
using (user_id = (select auth.uid()));

-- Public projection.
grant select on public.awarded_tenders_public to anon, authenticated;

-- Remaining table policies (documents, evaluations, awards, …) land with
-- the feature that first writes those tables. RLS is already ON so an
-- omitted policy fails closed (no access), which is the desired default.
