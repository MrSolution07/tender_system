-- Award insert must name a bid on the same tender. Existing rows already match,
-- and this trigger runs only on insert or when bid_id changes.

create or replace function public.copy_award_contractor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bid_tender uuid;
  bid_contractor uuid;
begin
  select b.tender_id, b.contractor_id into bid_tender, bid_contractor
  from public.bids b
  where b.id = new.bid_id;
  if bid_tender is null then
    raise exception 'Award needs a bid that is on the register';
  end if;
  if bid_tender is distinct from new.tender_id then
    raise exception 'That bid belongs to a different tender';
  end if;
  new.contractor_id := bid_contractor;
  return new;
end;
$$;

-- Profile safety net when app_metadata.role is set after the user row exists.
-- handle_new_user does not write back to auth.users.

drop trigger if exists on_auth_user_role_set on auth.users;

create trigger on_auth_user_role_set
after update of raw_app_meta_data on auth.users
for each row
when (new.raw_app_meta_data->>'role' is distinct from old.raw_app_meta_data->>'role')
execute function public.handle_new_user();

do $$
begin
  alter publication supabase_realtime add table public.tender_documents;
exception
  when duplicate_object then null;
end $$;
