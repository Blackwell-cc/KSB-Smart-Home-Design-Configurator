create table admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  email text not null check (email = lower(email) and char_length(email) between 3 and 254),
  role text not null check (role in ('pricing-admin', 'pricing-approver')),
  created_at timestamptz not null default now(),
  unique (user_id, role),
  unique (email, role)
);

create table price_book_reviews (
  price_book_id uuid primary key references price_books(id) on delete restrict,
  golden_cases_passed boolean not null default false,
  golden_case_results jsonb not null default '[]'::jsonb check (jsonb_typeof(golden_case_results) = 'array'),
  source_records jsonb not null default '[]'::jsonb check (jsonb_typeof(source_records) = 'array'),
  approved_by uuid,
  approved_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((approved_by is null) = (approved_at is null))
);

alter table admin_users enable row level security;
revoke all on table admin_users from public, anon, authenticated;
grant select, insert, update, delete on table admin_users to service_role;
alter table price_book_reviews enable row level security;
revoke all on table price_book_reviews from public, anon, authenticated;
grant select, insert, update, delete on table price_book_reviews to service_role;

create function public.guard_price_book_mutation()
returns trigger language plpgsql set search_path = public, pg_temp
as $$
begin
  if current_setting('ksb.publish_price_book', true) = 'on' then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;
  if tg_op = 'INSERT' and new.status = 'published' then raise exception 'PUBLISHED_PRICE_BOOK_IMMUTABLE' using errcode = 'P0001'; end if;
  if tg_op = 'UPDATE' and (old.status in ('published', 'retired') or new.status = 'published') then raise exception 'PUBLISHED_PRICE_BOOK_IMMUTABLE' using errcode = 'P0001'; end if;
  if tg_op = 'DELETE' and old.status in ('published', 'retired') then raise exception 'PUBLISHED_PRICE_BOOK_IMMUTABLE' using errcode = 'P0001'; end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

create trigger price_books_immutable_guard before insert or update or delete on price_books
  for each row execute function public.guard_price_book_mutation();

create function public.guard_price_book_entry_mutation()
returns trigger language plpgsql set search_path = public, pg_temp
as $$
declare book_status text; target_book_id uuid;
begin
  if tg_op = 'DELETE' then target_book_id := old.price_book_id; else target_book_id := new.price_book_id; end if;
  select status into book_status from price_books where id = target_book_id;
  if book_status in ('published', 'retired') then raise exception 'PUBLISHED_PRICE_BOOK_IMMUTABLE' using errcode = 'P0001'; end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

create trigger price_book_entries_immutable_guard before insert or update or delete on price_book_entries
  for each row execute function public.guard_price_book_entry_mutation();

create function public.valid_price_range(payload jsonb)
returns boolean language sql immutable set search_path = public, pg_temp
as $$
  select case when jsonb_typeof(payload) = 'object'
    and jsonb_typeof(payload->'low') = 'number'
    and jsonb_typeof(payload->'expected') = 'number'
    and jsonb_typeof(payload->'high') = 'number'
  then (payload->>'low')::numeric >= 0
    and (payload->>'low')::numeric <= (payload->>'expected')::numeric
    and (payload->>'expected')::numeric <= (payload->>'high')::numeric
  else false end;
$$;

revoke all on function public.valid_price_range(jsonb) from public, anon, authenticated;

create function public.invalid_price_book_entry(p_price_book_id uuid, p_canonical_provinces text[])
returns boolean language sql stable set search_path = public, pg_temp
as $$
  select
    (select count(*) <> 77 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'province-rate')
    or exists (select 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'province-rate' and (entry_key <> all(p_canonical_provinces) or not public.valid_price_range(payload)))
    or (select count(*) <> 3 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'material-factor')
    or exists (select 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'material-factor' and (entry_key <> all(array['select','premium','signature']) or case when jsonb_typeof(payload->'value') = 'number' then (payload->>'value')::numeric <= 0 or (payload->>'value')::numeric > 10 else true end))
    or (select count(*) <> 3 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'floor-factor')
    or exists (select 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'floor-factor' and (entry_key <> all(array['1','2','3']) or case when jsonb_typeof(payload->'value') = 'number' then (payload->>'value')::numeric <= 0 or (payload->>'value')::numeric > 10 else true end))
    or (select count(*) <> 3 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'site-access-factor')
    or exists (select 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'site-access-factor' and (entry_key <> all(array['normal','restricted','very-restricted']) or case when jsonb_typeof(payload->'value') = 'number' then (payload->>'value')::numeric <= 0 or (payload->>'value')::numeric > 10 else true end))
    or (select count(*) <> 3 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'site-risk')
    or exists (select 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'site-risk' and (entry_key <> all(array['normal','restricted','very-restricted']) or not public.valid_price_range(payload)))
    or (select count(*) <> 7 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'feature-allowance')
    or exists (select 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'feature-allowance' and (entry_key <> all(array['pool','lift','smart-home','solar','ev-charger','double-volume','large-glazing']) or not public.valid_price_range(payload)))
    or (select count(*) <> 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'design-fee-rates' and entry_key = 'default')
    or exists (select 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'design-fee-rates' and (entry_key <> 'default' or not public.valid_price_range(payload) or case when jsonb_typeof(payload->'high') = 'number' then (payload->>'high')::numeric > 1 else true end))
    or (select count(*) <> 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'tax-rate' and entry_key = 'default')
    or exists (select 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'tax-rate' and (entry_key <> 'default' or case when jsonb_typeof(payload->'value') = 'number' then (payload->>'value')::numeric < 0 or (payload->>'value')::numeric > 1 else true end))
    or (select count(*) <> 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'area-catalog' and entry_key = 'default')
    or exists (select 1 from price_book_entries where price_book_id = p_price_book_id and entry_type = 'area-catalog' and (entry_key <> 'default' or jsonb_typeof(payload) <> 'object' or jsonb_object_length(payload) <> 14 or not (payload ?& array['bedroomM2','bathroomM2','livingDiningBaseM2','livingDiningPerResidentM2','entryStorageM2','kitchenM2','serviceM2','circulationPerFloorM2','officeM2','elderlyRoomM2','thaiKitchenM2','multipurposeRoomM2','coveredParkingPerSpaceM2','coveredServiceM2']) or exists (select 1 from jsonb_each(payload) item where case when jsonb_typeof(item.value) = 'number' then (item.value #>> '{}')::numeric < 0 else true end)))
    or exists (select 1 from price_book_entries where price_book_id = p_price_book_id and btrim(source_label) = '');
$$;

revoke all on function public.invalid_price_book_entry(uuid, text[]) from public, anon, authenticated;

create function public.publish_price_book(p_candidate_id uuid, p_version text, p_actor_user_id uuid)
returns table (previous_status text, published_status text)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  candidate price_books%rowtype; review price_book_reviews%rowtype;
  canonical_provinces text[] := array['10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','60','61','62','63','64','65','66','67','70','71','72','73','74','75','76','77','80','81','82','83','84','85','86','90','91','92','93','94','95','96'];
begin
  perform pg_advisory_xact_lock(hashtext('ksb.publish_price_book'));
  if not exists (select 1 from admin_users where user_id = p_actor_user_id and role = 'pricing-approver') then raise exception 'PRICING_ADMIN_FORBIDDEN' using errcode = 'P0001'; end if;
  select * into candidate from price_books where id = p_candidate_id and version = p_version and status = 'review' for update;
  if not found then raise exception 'PRICE_BOOK_NOT_READY' using errcode = 'P0001'; end if;
  select * into review from price_book_reviews where price_book_id = candidate.id for update;
  if not found or not review.golden_cases_passed or review.approved_by is null or review.approved_at is null
    or jsonb_array_length(review.golden_case_results) = 0 or jsonb_array_length(review.source_records) = 0
    or exists (select 1 from jsonb_array_elements(review.source_records) source where case when jsonb_typeof(source) = 'string' then btrim(source #>> '{}') = '' else true end)
    or exists (select 1 from jsonb_array_elements(review.golden_case_results) golden where jsonb_typeof(golden) <> 'object' or jsonb_typeof(golden->'code') <> 'string' or jsonb_typeof(golden->'currentTotal') <> 'number' or jsonb_typeof(golden->'candidateTotal') <> 'number')
  then raise exception 'PRICE_BOOK_NOT_READY' using errcode = 'P0001'; end if;
  if array_length(canonical_provinces, 1) <> 77 then raise exception 'PRICE_BOOK_NOT_READY' using errcode = 'P0001'; end if;
  if public.invalid_price_book_entry(candidate.id, canonical_provinces) then raise exception 'PRICE_BOOK_NOT_READY' using errcode = 'P0001'; end if;
  perform set_config('ksb.publish_price_book', 'on', true);
  if exists (select 1 from price_books where status = 'published' for update) then
    update price_books set status = 'retired' where status = 'published'; previous_status := 'retired';
  else previous_status := 'none'; end if;
  update price_books set status = 'published', approved_by = review.approved_by, approved_at = review.approved_at where id = candidate.id;
  published_status := 'published'; return next;
end;
$$;

revoke all on function public.publish_price_book(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.publish_price_book(uuid, text, uuid) to service_role;

create function public.load_price_book_review_dashboard()
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare candidate price_books%rowtype; review price_book_reviews%rowtype;
begin
  select * into candidate from price_books where status = 'review' order by created_at desc limit 1;
  if not found then return null; end if;
  select * into review from price_book_reviews where price_book_id = candidate.id;
  if not found then return null; end if;
  return jsonb_build_object(
    'draft', jsonb_build_object(
      'candidateId', candidate.id,
      'version', candidate.version,
      'referenceDate', candidate.reference_date,
      'provinceEntries', coalesce((select jsonb_agg(jsonb_build_object('code', entry_key) order by entry_key) from price_book_entries where price_book_id = candidate.id and entry_type = 'province-rate'), '[]'::jsonb),
      'materialLevels', coalesce((select jsonb_agg(entry_key order by entry_key) from price_book_entries where price_book_id = candidate.id and entry_type = 'material-factor'), '[]'::jsonb),
      'specialFeatures', coalesce((select jsonb_agg(entry_key order by entry_key) from price_book_entries where price_book_id = candidate.id and entry_type = 'feature-allowance'), '[]'::jsonb),
      'featureAllowances', coalesce((select jsonb_object_agg(entry_key, payload) from price_book_entries where price_book_id = candidate.id and entry_type = 'feature-allowance'), '{}'::jsonb),
      'goldenCasesPassed', review.golden_cases_passed,
      'approvedBy', review.approved_by,
      'approvedAt', review.approved_at,
      'sources', review.source_records
    ),
    'goldenCases', review.golden_case_results
  );
end;
$$;

revoke all on function public.load_price_book_review_dashboard() from public, anon, authenticated;
grant execute on function public.load_price_book_review_dashboard() to service_role;
