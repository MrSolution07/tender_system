-- Opening register. Accounts are confirmed. Role is app_metadata, never user_metadata.

create extension if not exists pgcrypto;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'thandi.mokoena@majortech.example', crypt('preview', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"procurement_officer"}'::jsonb, '{"full_name":"Thandi Mokoena","department":"National Treasury"}'::jsonb, now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'johan.pietersen@majortech.example', crypt('preview', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"evaluator"}'::jsonb, '{"full_name":"Johan Pietersen","department":"National Treasury"}'::jsonb, now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'ayesha.khan@majortech.example', crypt('preview', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"super_admin"}'::jsonb, '{"full_name":"Ayesha Khan","department":"National Treasury"}'::jsonb, now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-8444-444444444444', 'authenticated', 'authenticated', 'lerato.dlamini@umhlaba.example', crypt('preview', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"contractor"}'::jsonb, '{"full_name":"Lerato Dlamini"}'::jsonb, now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-4555-8555-555555555555', 'authenticated', 'authenticated', 'accounts@cedarpine.example', crypt('preview', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"contractor"}'::jsonb, '{"full_name":"Cedar and Pine Furniture"}'::jsonb, now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '66666666-6666-4666-8666-666666666666', 'authenticated', 'authenticated', 'accounts@lekkerasphalt.example', crypt('preview', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"contractor"}'::jsonb, '{"full_name":"Lekker Asphalt"}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
select
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.id::text,
  now(),
  now(),
  now()
from auth.users u
where u.id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555',
  '66666666-6666-4666-8666-666666666666'
)
and not exists (
  select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
);

update public.profiles
set department = 'National Treasury'
where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333'
);

insert into public.contractors (id, profile_id, company_name, registration_number, compliance_status)
values
  ('77777777-7777-4777-8777-777777777777', '44444444-4444-4444-8444-444444444444', 'Umhlaba Civils', '2014/084412/07', 'current'),
  ('88888888-8888-4888-8888-888888888888', '55555555-5555-4555-8555-555555555555', 'Cedar & Pine Furniture', '2009/221904/07', 'current'),
  ('99999999-9999-4999-8999-999999999999', '66666666-6666-4666-8666-666666666666', 'Lekker Asphalt (Pty) Ltd', '2011/055218/07', 'current')
on conflict (id) do nothing;

insert into public.tenders (id, created_by, title, description, category, department, budget_cents, status, published_at, closing_at)
values
  ('a1000001-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Resurfacing of Voortrekker Road, phase 2', 'Mill and replace the asphalt wearing course between Main Reef Road and Ontdekkers Road, including new road markings and pedestrian crossings at two schools.', 'Roads', 'City of Johannesburg Roads', 1840000000, 'published', '2026-09-08T08:00:00Z', '2026-10-02T16:00:00Z'),
  ('a1000001-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Clinic consumables for Gauteng district facilities', 'Twelve-month supply of examination gloves, syringes, and wound dressings for 40 primary clinics. Deliveries monthly to a central store in Auckland Park.', 'Health supplies', 'Gauteng Department of Health', 625000000, 'published', '2026-09-12T08:00:00Z', '2026-10-20T16:00:00Z'),
  ('a1000001-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Learner desks and chairs for 18 schools', 'Manufacture and deliver hardwood-substitute desks and chairs sized for grades 4 to 7. Installation included at each school.', 'Furniture', 'Western Cape Education', 480000000, 'published', '2026-09-01T08:00:00Z', '2026-11-15T16:00:00Z'),
  ('a1000001-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'Replacement of ageing water mains in KwaMashu', 'Replace 6.4 km of asbestos-cement main with uPVC, reconnect household leads, and reinstate verges. Night work required on two arterial crossings.', 'Water', 'eThekwini Water and Sanitation', 2210000000, 'evaluating', '2026-07-14T08:00:00Z', '2026-08-28T16:00:00Z'),
  ('a1000001-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'New sheeting for the New Brighton community hall roof', 'Strip the failed corrugated roof, replace truss bracing where rotten, and fit insulated sheeting with new gutters.', 'Buildings', 'Nelson Mandela Bay Municipality', 315000000, 'awarded', '2026-04-02T08:00:00Z', '2026-05-06T16:00:00Z'),
  ('a1000001-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'Fit-out of the Mangaung central library mezzanine', 'Shelving, lighting, and a children''s reading corner on the new mezzanine. Work happened around a library that stayed open.', 'Buildings', 'Mangaung Metro', 264000000, 'completed', '2025-11-03T08:00:00Z', '2025-12-01T16:00:00Z'),
  ('a1000001-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', 'Three rear-loading refuse compactors', 'Supply and commission three 19 m³ rear loaders for the west depot, with a two-year maintenance plan.', 'Fleet', 'City of Tshwane', 990000000, 'closed', '2026-08-04T08:00:00Z', '2026-09-01T16:00:00Z'),
  ('a1000001-0000-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111', 'Core network refresh for the procurement floor', 'Replace end-of-life switches on two floors and recertify the fibre uplinks.', 'Technology', 'National Treasury', 185000000, 'draft', null, '2026-12-04T16:00:00Z'),
  ('a1000001-0000-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', 'Street lighting maintenance, Mangaung 2024', 'Lamp replacement and cable repairs on the agreed municipal routes for the 2024 financial year.', 'Electrical', 'Mangaung Metro', 910000000, 'archived', '2024-02-01T08:00:00Z', '2024-03-15T16:00:00Z')
on conflict (id) do nothing;

insert into public.tender_requirements (id, tender_id, body, mandatory, sort_order)
values
  ('b1000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000001', 'CIDB grading of 7 CE or higher.', true, 1),
  ('b1000001-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000001', 'Traffic accommodation plan for a live urban corridor.', true, 2),
  ('b1000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000002', 'SAHPRA-listed products with batch traceability.', true, 1),
  ('b1000001-0000-4000-8000-000000000004', 'a1000001-0000-4000-8000-000000000003', 'SANS 660-compliant seating, five-year frame warranty.', true, 1),
  ('b1000001-0000-4000-8000-000000000005', 'a1000001-0000-4000-8000-000000000004', 'CIDB grading of 8 CE and a pipe-laying method statement.', true, 1),
  ('b1000001-0000-4000-8000-000000000006', 'a1000001-0000-4000-8000-000000000005', 'Registered roofing contractor with fall-protection plan.', true, 1),
  ('b1000001-0000-4000-8000-000000000007', 'a1000001-0000-4000-8000-000000000006', 'Interior contractor with public-building references.', true, 1),
  ('b1000001-0000-4000-8000-000000000008', 'a1000001-0000-4000-8000-000000000007', 'Vehicles must meet current NRTA axle limits.', true, 1),
  ('b1000001-0000-4000-8000-000000000009', 'a1000001-0000-4000-8000-000000000008', 'OEM or authorised partner for the named switch family.', true, 1)
on conflict (id) do nothing;

insert into public.tender_documents (id, tender_id, uploaded_by, kind, storage_path, file_name, mime_type)
values
  ('c1000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'specification', 'a1000001-0000-4000-8000-000000000001/voortrekker-specification.pdf', 'voortrekker-specification.pdf', 'application/pdf'),
  ('c1000001-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'specification', 'a1000001-0000-4000-8000-000000000002/clinic-schedule-of-goods.pdf', 'clinic-schedule-of-goods.pdf', 'application/pdf'),
  ('c1000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'specification', 'a1000001-0000-4000-8000-000000000003/furniture-drawings.pdf', 'furniture-drawings.pdf', 'application/pdf'),
  ('c1000001-0000-4000-8000-000000000004', 'a1000001-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'specification', 'a1000001-0000-4000-8000-000000000004/kwamashu-scope.pdf', 'kwamashu-scope.pdf', 'application/pdf'),
  ('c1000001-0000-4000-8000-000000000005', 'a1000001-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'specification', 'a1000001-0000-4000-8000-000000000005/hall-roof-spec.pdf', 'hall-roof-spec.pdf', 'application/pdf'),
  ('c1000001-0000-4000-8000-000000000006', 'a1000001-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'specification', 'a1000001-0000-4000-8000-000000000006/library-fitout.pdf', 'library-fitout.pdf', 'application/pdf')
on conflict (id) do nothing;

insert into public.ai_analyses (id, document_id, tender_id, review_status, summary, model, reviewed_by, reviewed_at)
values
  ('d1000001-0000-4000-8000-000000000001', 'c1000001-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000002', 'needs_review', 'The schedule lists examination gloves, syringes, and dressings. Closing date in the document reads 20 October 2026. A line about cold-chain vaccines appears in an appendix and may not belong in this tender.', 'document-extractor', null, null),
  ('d1000001-0000-4000-8000-000000000002', 'c1000001-0000-4000-8000-000000000004', 'a1000001-0000-4000-8000-000000000004', 'needs_review', 'Scope is 6.4 km of main replacement in KwaMashu. The document names night work at two crossings. No award recommendation is present.', 'document-extractor', null, null),
  ('d1000001-0000-4000-8000-000000000003', 'c1000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000003', 'approved', 'Eighteen schools, grades 4 to 7, desks and chairs, installation included. Quantities match the schedule of goods.', 'document-extractor', '11111111-1111-4111-8111-111111111111', '2026-09-04T10:00:00Z')
on conflict (id) do nothing;

insert into public.bids (id, tender_id, contractor_id, amount_cents, note, status, submitted_at)
values
  ('e1000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000002', '77777777-7777-4777-8777-777777777777', 598000000, 'Monthly delivery to the Auckland Park store.', 'submitted', '2026-09-18T09:00:00Z'),
  ('e1000001-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000003', '77777777-7777-4777-8777-777777777777', 455000000, '', 'draft', null),
  ('e1000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000004', '77777777-7777-4777-8777-777777777777', 2140000000, 'Night work included at both arterial crossings.', 'submitted', '2026-08-20T09:00:00Z'),
  ('e1000001-0000-4000-8000-000000000004', 'a1000001-0000-4000-8000-000000000004', '99999999-9999-4999-8999-999999999999', 2085000000, 'Method statement covers night work.', 'submitted', '2026-08-21T09:00:00Z'),
  ('e1000001-0000-4000-8000-000000000005', 'a1000001-0000-4000-8000-000000000005', '77777777-7777-4777-8777-777777777777', 289000000, 'Fall-protection plan attached.', 'accepted', '2026-05-02T09:00:00Z'),
  ('e1000001-0000-4000-8000-000000000006', 'a1000001-0000-4000-8000-000000000006', '88888888-8888-4888-8888-888888888888', 241000000, 'Installation around an open library.', 'accepted', '2025-11-20T09:00:00Z')
on conflict (id) do nothing;

insert into public.evaluator_assignments (id, tender_id, evaluator_id, assigned_by)
values ('f1000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111')
on conflict (id) do nothing;

insert into public.evaluations (id, bid_id, evaluator_id, score, comments, compliance_pass)
values
  ('f2000001-0000-4000-8000-000000000001', 'e1000001-0000-4000-8000-000000000003', '22222222-2222-4222-8222-222222222222', null, '', null),
  ('f2000001-0000-4000-8000-000000000002', 'e1000001-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 71, 'Method statement covers night work. Plant list is thin on compaction.', true)
on conflict (id) do nothing;

insert into public.awards (id, tender_id, bid_id, awarded_by, awarded_at)
values
  ('f3000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000005', 'e1000001-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', '2026-06-18T10:00:00Z'),
  ('f3000001-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000006', 'e1000001-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', '2026-01-20T10:00:00Z')
on conflict (id) do nothing;

insert into public.projects (id, award_id, title, status, progress_percent, location_label, started_at, completed_at)
values
  ('f4000001-0000-4000-8000-000000000001', 'f3000001-0000-4000-8000-000000000001', 'New Brighton community hall roof', 'in_progress', 62, 'New Brighton, Gqeberha', '2026-07-01T08:00:00Z', null),
  ('f4000001-0000-4000-8000-000000000002', 'f3000001-0000-4000-8000-000000000002', 'Mangaung library mezzanine', 'completed', 100, 'Bloemfontein', '2026-02-02T08:00:00Z', '2026-06-30T16:00:00Z')
on conflict (id) do nothing;

insert into public.expenditure (id, project_id, amount_cents, spent_on, description, created_by)
values
  ('f5000001-0000-4000-8000-000000000001', 'f4000001-0000-4000-8000-000000000001', 142000000, '2026-08-12', 'Sheeting and gutters', '11111111-1111-4111-8111-111111111111'),
  ('f5000001-0000-4000-8000-000000000002', 'f4000001-0000-4000-8000-000000000001', 38000000, '2026-09-03', 'Truss repairs', '11111111-1111-4111-8111-111111111111'),
  ('f5000001-0000-4000-8000-000000000003', 'f4000001-0000-4000-8000-000000000002', 98000000, '2026-04-15', 'Shelving', '11111111-1111-4111-8111-111111111111'),
  ('f5000001-0000-4000-8000-000000000004', 'f4000001-0000-4000-8000-000000000002', 64000000, '2026-05-20', 'Lighting and reading corner', '11111111-1111-4111-8111-111111111111')
on conflict (id) do nothing;
