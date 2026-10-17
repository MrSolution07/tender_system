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
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
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

-- Role from profiles (source of truth), not user_metadata.
-- Definer so policies that call this do not recurse through profiles RLS.
-- Created after profiles so the SQL body can resolve the table.
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid());
$$;

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
  note text,
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
  contractor_id uuid references public.contractors (id),
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
  p.id as project_id,
  p.title as project_title,
  p.status as project_status,
  p.progress_percent,
  p.location_label
from public.tenders t
join public.awards a on a.tender_id = t.id
join public.contractors c on c.id = a.contractor_id
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

-- Published notices the public may read. No bids, scores, or contact details.
create view public.published_tenders_public
with (security_invoker = true) as
select
  id,
  title,
  description,
  category,
  department,
  budget_cents,
  currency,
  status,
  published_at,
  closing_at
from public.tenders
where status = 'published';

-- ---------------------------------------------------------------------------
-- Role helpers used by policies. security invoker so RLS still applies.
-- ---------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select public.current_app_role() in ('super_admin', 'procurement_officer', 'evaluator');
$$;

create or replace function public.is_officer()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select public.current_app_role() in ('super_admin', 'procurement_officer');
$$;

create or replace function public.enforce_tender_transition()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null or old.status is not distinct from new.status then
    return new;
  end if;
  if not (
    (old.status = 'draft' and new.status in ('published', 'archived'))
    or (old.status = 'published' and new.status in ('closed', 'archived'))
    or (old.status = 'closed' and new.status in ('evaluating', 'archived'))
    or (old.status = 'evaluating' and new.status in ('awarded', 'archived'))
    or (old.status = 'awarded' and new.status in ('completed', 'archived'))
    or (old.status = 'completed' and new.status = 'archived')
  ) then
    raise exception 'status change from % to % is not allowed', old.status, new.status;
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger tenders_status_transition
before update on public.tenders
for each row execute function public.enforce_tender_transition();

create or replace function public.enforce_bid_window()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  tender_status public.tender_status;
  tender_closes timestamptz;
begin
  if auth.uid() is null then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status is not distinct from new.status then
    return new;
  end if;
  if new.status <> 'submitted' then
    return new;
  end if;
  select status, closing_at into tender_status, tender_closes
  from public.tenders
  where id = new.tender_id;
  if tender_status is distinct from 'published' or tender_closes is null or tender_closes < now() then
    raise exception 'This notice is not open for bids';
  end if;
  new.submitted_at = coalesce(new.submitted_at, now());
  return new;
end;
$$;

create trigger bids_window
before insert or update on public.bids
for each row execute function public.enforce_bid_window();

create or replace function public.copy_award_contractor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select b.contractor_id into new.contractor_id
  from public.bids b
  where b.id = new.bid_id;
  return new;
end;
$$;

create trigger awards_contractor
before insert or update of bid_id on public.awards
for each row execute function public.copy_award_contractor();

create or replace function public.notify_bid_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  officer uuid;
  tender_title text;
begin
  if auth.uid() is null then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'submitted' then
    return new;
  end if;
  if new.status <> 'submitted' then
    return new;
  end if;
  select title, created_by into tender_title, officer
  from public.tenders
  where id = new.tender_id;
  insert into public.notifications (user_id, title, body, kind)
  values (officer, 'Bid submitted', tender_title, 'bid_submitted');
  return new;
end;
$$;

create trigger bids_notify
after insert or update on public.bids
for each row execute function public.notify_bid_submitted();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned public.app_role;
begin
  begin
    assigned := nullif(new.raw_app_meta_data->>'role', '')::public.app_role;
  exception
    when invalid_text_representation then
      assigned := null;
  end;
  if assigned is null then
    return new;
  end if;
  insert into public.profiles (id, role, full_name, department)
  values (
    new.id,
    assigned,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data->>'department', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public;
revoke all on function public.copy_award_contractor() from public;
revoke all on function public.notify_bid_submitted() from public;
revoke all on function public.current_app_role() from public;
grant execute on function public.handle_new_user() to supabase_auth_admin;
grant execute on function public.current_app_role() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS
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

create policy profiles_select on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or public.is_staff()
);

create policy profiles_update_self on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = public.current_app_role());

create policy tenders_staff_select on public.tenders
for select to authenticated
using (public.is_staff());

create policy tenders_officer_write on public.tenders
for insert to authenticated
with check (public.is_officer() and created_by = (select auth.uid()));

create policy tenders_officer_update on public.tenders
for update to authenticated
using (public.is_officer())
with check (public.is_officer());

create policy tenders_contractor_select on public.tenders
for select to authenticated
using (
  public.current_app_role() = 'contractor'
  and status in ('published', 'closed', 'evaluating', 'awarded', 'completed')
);

create policy tenders_anon_published on public.tenders
for select to anon
using (status in ('published', 'awarded', 'completed'));

create policy contractors_select on public.contractors
for select to anon, authenticated
using (
  profile_id = (select auth.uid())
  or public.is_staff()
  or id in (
    select a.contractor_id
    from public.awards a
    join public.tenders t on t.id = a.tender_id
    where a.contractor_id is not null
      and t.status in ('awarded', 'completed')
  )
);

create policy contractors_officer_write on public.contractors
for insert to authenticated
with check (public.is_officer() or profile_id = (select auth.uid()));

create policy contractors_owner_update on public.contractors
for update to authenticated
using (profile_id = (select auth.uid()) or public.is_officer())
with check (profile_id = (select auth.uid()) or public.is_officer());

create policy tender_documents_read on public.tender_documents
for select to anon, authenticated
using (
  public.is_staff()
  or tender_id in (
    select t.id from public.tenders t
    where t.status in ('published', 'closed', 'evaluating', 'awarded', 'completed')
  )
);

create policy tender_documents_officer_write on public.tender_documents
for insert to authenticated
with check (public.is_officer() and uploaded_by = (select auth.uid()));

create policy tender_requirements_read on public.tender_requirements
for select to anon, authenticated
using (
  public.is_staff()
  or tender_id in (
    select t.id from public.tenders t
    where t.status in ('published', 'awarded', 'completed')
  )
);

create policy tender_requirements_officer_write on public.tender_requirements
for insert to authenticated
with check (public.is_officer());

create policy criteria_staff on public.evaluation_criteria
for select to authenticated
using (public.is_staff());

create policy criteria_officer_write on public.evaluation_criteria
for insert to authenticated
with check (public.is_officer());

create policy ai_staff_select on public.ai_analyses
for select to authenticated
using (public.is_staff());

create policy ai_officer_update on public.ai_analyses
for update to authenticated
using (public.is_officer())
with check (public.is_officer());

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
using (public.is_staff());

create policy bid_documents_parties on public.bid_documents
for select to authenticated
using (
  public.is_staff()
  or bid_id in (
    select b.id from public.bids b
    join public.contractors c on c.id = b.contractor_id
    where c.profile_id = (select auth.uid())
  )
);

create policy bid_documents_owner_write on public.bid_documents
for insert to authenticated
with check (
  bid_id in (
    select b.id from public.bids b
    join public.contractors c on c.id = b.contractor_id
    where c.profile_id = (select auth.uid())
  )
);

create policy bid_responses_parties on public.bid_requirement_responses
for all to authenticated
using (
  public.is_staff()
  or bid_id in (
    select b.id from public.bids b
    join public.contractors c on c.id = b.contractor_id
    where c.profile_id = (select auth.uid())
  )
)
with check (
  bid_id in (
    select b.id from public.bids b
    join public.contractors c on c.id = b.contractor_id
    where c.profile_id = (select auth.uid())
  )
);

create policy assignments_read on public.evaluator_assignments
for select to authenticated
using (evaluator_id = (select auth.uid()) or public.is_officer());

create policy assignments_officer_write on public.evaluator_assignments
for insert to authenticated
with check (public.is_officer() and assigned_by = (select auth.uid()));

create policy evaluations_access on public.evaluations
for select to authenticated
using (evaluator_id = (select auth.uid()) or public.is_officer());

create policy evaluations_evaluator_write on public.evaluations
for insert to authenticated
with check (evaluator_id = (select auth.uid()));

create policy evaluations_evaluator_update on public.evaluations
for update to authenticated
using (evaluator_id = (select auth.uid()))
with check (evaluator_id = (select auth.uid()));

create policy awards_read on public.awards
for select to anon, authenticated
using (
  public.is_staff()
  or tender_id in (
    select t.id from public.tenders t
    where t.status in ('awarded', 'completed')
  )
);

create policy awards_officer_write on public.awards
for insert to authenticated
with check (public.is_officer() and awarded_by = (select auth.uid()));

create policy projects_read on public.projects
for select to anon, authenticated
using (
  public.is_staff()
  or award_id in (
    select a.id from public.awards a
    join public.tenders t on t.id = a.tender_id
    where t.status in ('awarded', 'completed')
  )
);

create policy projects_officer_write on public.projects
for insert to authenticated
with check (public.is_officer());

create policy projects_officer_update on public.projects
for update to authenticated
using (public.is_officer())
with check (public.is_officer());

create policy expenditure_read on public.expenditure
for select to anon, authenticated
using (
  public.is_officer()
  or project_id in (
    select p.id from public.projects p
    join public.awards a on a.id = p.award_id
    join public.tenders t on t.id = a.tender_id
    where t.status in ('awarded', 'completed')
  )
);

create policy expenditure_officer_write on public.expenditure
for insert to authenticated
with check (public.is_officer() and created_by = (select auth.uid()));

create policy notifications_own on public.notifications
for select to authenticated
using (user_id = (select auth.uid()));

create policy notifications_own_update on public.notifications
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy audit_officer_select on public.audit_logs
for select to authenticated
using (public.is_officer());

create policy audit_staff_insert on public.audit_logs
for insert to authenticated
with check (public.is_staff() and actor_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.published_tenders_public, public.awarded_tenders_public to anon, authenticated;
grant select on public.tenders, public.tender_documents, public.tender_requirements,
  public.contractors, public.awards, public.projects, public.expenditure to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke all on public.bids, public.evaluations, public.ai_analyses, public.evaluator_assignments, public.bid_documents, public.bid_requirement_responses from anon;
