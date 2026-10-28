-- Super admin creates a confirmed account. Role lives in app_metadata.
-- handle_new_user copies it onto profiles. No service role in the browser.

create or replace function public.create_account(
  p_email text,
  p_password text,
  p_full_name text,
  p_role public.app_role,
  p_department text default null,
  p_company text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  new_id uuid := gen_random_uuid();
  clean_email text := lower(trim(p_email));
  clean_name text := trim(p_full_name);
  clean_department text := nullif(trim(coalesce(p_department, '')), '');
  clean_company text := nullif(trim(coalesce(p_company, '')), '');
begin
  if public.current_app_role() is distinct from 'super_admin' then
    raise exception 'Only a super admin can create accounts';
  end if;

  if clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email';
  end if;

  if char_length(p_password) < 8 then
    raise exception 'Password must be at least 8 characters';
  end if;

  if char_length(clean_name) < 2 then
    raise exception 'Enter the full name';
  end if;

  if exists (select 1 from auth.users u where lower(u.email) = clean_email) then
    raise exception 'An account with this email already exists';
  end if;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    new_id,
    'authenticated',
    'authenticated',
    clean_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email'),
      'role', p_role
    ),
    jsonb_strip_nulls(jsonb_build_object(
      'full_name', clean_name,
      'department', clean_department
    )),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    user_id,
    identity_data,
    provider,
    provider_id,
    email,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    new_id,
    jsonb_build_object('sub', new_id::text, 'email', clean_email),
    'email',
    new_id::text,
    clean_email,
    now(),
    now(),
    now()
  );

  if p_role = 'contractor' then
    insert into public.contractors (profile_id, company_name)
    values (new_id, coalesce(clean_company, clean_name));
  end if;

  return new_id;
end;
$$;

create or replace function public.list_accounts()
returns table (
  id uuid,
  email text,
  full_name text,
  role public.app_role,
  department text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if public.current_app_role() is distinct from 'super_admin' then
    raise exception 'Only a super admin can list accounts';
  end if;

  return query
  select p.id, u.email::text, p.full_name, p.role, p.department, p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  order by p.created_at desc;
end;
$$;

revoke all on function public.create_account(text, text, text, public.app_role, text, text) from public, anon;
revoke all on function public.list_accounts() from public, anon;
grant execute on function public.create_account(text, text, text, public.app_role, text, text) to authenticated;
grant execute on function public.list_accounts() to authenticated;
