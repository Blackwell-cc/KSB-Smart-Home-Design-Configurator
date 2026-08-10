create table consultation_outbox (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  lead_id uuid not null references leads(id) on delete restrict,
  event_type text not null check (event_type = 'consultation_requested'),
  status text not null default 'pending' check (status in ('pending', 'delivered', 'failed')),
  context_reference jsonb not null check (jsonb_typeof(context_reference) = 'object'),
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  unique (project_id, event_type)
);

create function public.assert_snapshot_concept_metadata()
returns trigger language plpgsql set search_path = public, pg_temp
as $$
begin
  if coalesce(jsonb_typeof(new.payload->'concept'), '') <> 'object'
    or coalesce(jsonb_typeof(new.payload->'concept'->'id'), '') <> 'string'
    or coalesce(jsonb_typeof(new.payload->'concept'->'label'), '') <> 'string'
    or coalesce(jsonb_typeof(new.payload->'concept'->'imageSrc'), '') <> 'string'
    or (new.payload->'concept'->>'imageSrc') !~ '^/concepts/[a-z0-9-]+\\.png$' then
    raise exception 'INVALID_SNAPSHOT_CONCEPT' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger calculation_snapshots_require_concept_metadata
  before insert or update of payload on calculation_snapshots
  for each row execute function public.assert_snapshot_concept_metadata();

alter table consultation_outbox enable row level security;
revoke all on table consultation_outbox from public, anon, authenticated;
grant select, insert, update, delete on table consultation_outbox to service_role;

create function public.request_consultation_once(p_project_id uuid)
returns table (consultation_requested_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare current_requested_at timestamptz; project_lead_id uuid;
begin
  select lead_id, consultation_requested_at into project_lead_id, current_requested_at
    from projects where id = p_project_id for update;
  if project_lead_id is null then raise exception 'PROJECT_NOT_FOUND' using errcode = 'P0001'; end if;
  if current_requested_at is null then
    update projects set consultation_requested_at = now() where id = p_project_id
      returning consultation_requested_at into current_requested_at;
    insert into consultation_outbox (project_id, lead_id, event_type, status, context_reference)
      values (p_project_id, project_lead_id, 'consultation_requested', 'pending', jsonb_build_object('projectId', p_project_id, 'leadId', project_lead_id))
      on conflict (project_id, event_type) do nothing;
  end if;
  return query select current_requested_at;
end;
$$;

revoke all on function public.request_consultation_once(uuid) from public, anon, authenticated;
grant execute on function public.request_consultation_once(uuid) to service_role;
