create table calculation_snapshots (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete restrict,
  price_book_id uuid not null references price_books(id) on delete restrict,
  pricing_version text not null,
  reference_date date not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete restrict,
  idempotency_key uuid not null unique,
  name text not null check (char_length(name) between 1 and 120),
  preferred_contact_method text not null check (preferred_contact_method in ('phone', 'email', 'line')),
  phone text,
  email text,
  line_id text,
  consent_version text not null references consent_versions(version) on delete restrict,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (
    (preferred_contact_method = 'phone' and phone is not null and email is null and line_id is null) or
    (preferred_contact_method = 'email' and email is not null and phone is null and line_id is null) or
    (preferred_contact_method = 'line' and line_id is not null and phone is null and email is null)
  )
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references configurations(id) on delete restrict,
  calculation_snapshot_id uuid not null references calculation_snapshots(id) on delete restrict,
  lead_id uuid not null unique references leads(id) on delete restrict,
  consultation_requested_at timestamptz,
  created_at timestamptz not null default now()
);

create table project_access_tokens (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  token_hash bytea not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index projects_configuration_id_idx on projects (configuration_id);
create index calculation_snapshots_configuration_id_idx on calculation_snapshots (configuration_id);
create index project_access_tokens_project_id_idx on project_access_tokens (project_id);

alter table calculation_snapshots enable row level security;
alter table leads enable row level security;
alter table projects enable row level security;
alter table project_access_tokens enable row level security;

create function public.submit_lead_once(
  p_configuration_id uuid, p_schema_version integer, p_configuration jsonb,
  p_price_book_id uuid, p_pricing_version text, p_reference_date date, p_snapshot jsonb,
  p_idempotency_key uuid, p_name text, p_preferred_contact_method text,
  p_phone text, p_email text, p_line_id text, p_consent_version text,
  p_token_hash_hex text, p_expires_at timestamptz
) returns table (lead_id uuid, project_id uuid)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare existing_lead uuid; existing_project uuid; snapshot_id uuid; active_consent boolean;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 0));
  select l.id, p.id into existing_lead, existing_project from leads l join projects p on p.lead_id = l.id where l.idempotency_key = p_idempotency_key;
  if existing_lead is not null then return query select existing_lead, existing_project; return; end if;
  select active into active_consent from consent_versions where version = p_consent_version;
  if coalesce(active_consent, false) is not true then raise exception 'CONSENT_VERSION_INACTIVE' using errcode = 'P0001'; end if;
  insert into configurations (id, schema_version, payload) values (p_configuration_id, p_schema_version, p_configuration);
  insert into calculation_snapshots (configuration_id, price_book_id, pricing_version, reference_date, payload)
    values (p_configuration_id, p_price_book_id, p_pricing_version, p_reference_date, p_snapshot) returning id into snapshot_id;
  insert into leads (configuration_id, idempotency_key, name, preferred_contact_method, phone, email, line_id, consent_version)
    values (p_configuration_id, p_idempotency_key, p_name, p_preferred_contact_method, p_phone, p_email, p_line_id, p_consent_version) returning id into existing_lead;
  insert into projects (configuration_id, calculation_snapshot_id, lead_id) values (p_configuration_id, snapshot_id, existing_lead) returning id into existing_project;
  insert into project_access_tokens (project_id, token_hash, expires_at) values (existing_project, decode(p_token_hash_hex, 'hex'), p_expires_at);
  return query select existing_lead, existing_project;
end;
$$;

revoke all on table configurations, consent_versions, price_books, price_book_entries, calculation_snapshots, leads, projects, project_access_tokens from public, anon, authenticated;
revoke all on function public.submit_lead_once(uuid, integer, jsonb, uuid, text, date, jsonb, uuid, text, text, text, text, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.submit_lead_once(uuid, integer, jsonb, uuid, text, date, jsonb, uuid, text, text, text, text, text, text, text, timestamptz) to service_role;
