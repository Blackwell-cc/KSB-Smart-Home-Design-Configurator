alter table admin_users drop constraint admin_users_role_check;
alter table admin_users add constraint admin_users_role_check check (role in ('pricing-admin', 'pricing-approver', 'privacy-operator'));

create table lead_form_sessions (
  session_id text primary key check (char_length(session_id) between 1 and 128 and session_id ~ '^[A-Za-z0-9_-]+$'),
  started_at timestamptz not null,
  submitted_at timestamptz,
  abandoned_at timestamptz,
  abandonment_reason text check (abandonment_reason in ('explicit-leave', 'expired')),
  check (submitted_at is null or abandoned_at is null)
);

alter table lead_form_sessions enable row level security;
revoke all on table lead_form_sessions from public, anon, authenticated;
grant select, insert, update, delete on table lead_form_sessions to service_role;

create function public.start_lead_form_session(p_session_id text, p_started_at timestamptz)
returns void language sql security definer set search_path = public, pg_temp
as $$ insert into lead_form_sessions (session_id, started_at) values (p_session_id, p_started_at) on conflict (session_id) do nothing; $$;

create function public.submit_lead_form_session(p_session_id text, p_submitted_at timestamptz)
returns void language sql security definer set search_path = public, pg_temp
as $$ update lead_form_sessions set submitted_at = p_submitted_at, abandoned_at = null, abandonment_reason = null where session_id = p_session_id and submitted_at is null; $$;

create function public.abandon_lead_form_session(p_session_id text, p_abandoned_at timestamptz, p_reason text)
returns void language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if p_reason <> 'explicit-leave' then raise exception 'INVALID_ABANDONMENT_REASON' using errcode = 'P0001'; end if;
  update lead_form_sessions set abandoned_at = p_abandoned_at, abandonment_reason = p_reason where session_id = p_session_id and submitted_at is null and abandoned_at is null;
end;
$$;

create function public.expire_lead_form_sessions(p_cutoff timestamptz, p_expired_at timestamptz)
returns integer language plpgsql security definer set search_path = public, pg_temp
as $$
declare affected integer;
begin
  update lead_form_sessions set abandoned_at = p_expired_at, abandonment_reason = 'expired'
    where started_at < p_cutoff and submitted_at is null and abandoned_at is null;
  get diagnostics affected = row_count; return affected;
end;
$$;

create function public.export_project_data(p_lead_id uuid)
returns jsonb language sql stable security definer set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'contact', jsonb_build_object('name', l.name, 'preferredContactMethod', l.preferred_contact_method, 'phone', l.phone, 'email', l.email, 'lineId', l.line_id),
    'consent', jsonb_build_object('version', l.consent_version, 'consentedAt', l.consented_at),
    'configuration', c.payload,
    'snapshot', s.payload
  )
  from leads l join projects p on p.lead_id = l.id join configurations c on c.id = l.configuration_id join calculation_snapshots s on s.id = p.calculation_snapshot_id
  where l.id = p_lead_id;
$$;

create function public.perform_privacy_delete(p_lead_id uuid)
returns boolean language plpgsql security definer set search_path = public, pg_temp
as $$
declare target_project_id uuid; target_configuration_id uuid; target_snapshot_id uuid;
begin
  select p.id, l.configuration_id, p.calculation_snapshot_id into target_project_id, target_configuration_id, target_snapshot_id
    from leads l join projects p on p.lead_id = l.id where l.id = p_lead_id for update;
  if not found then return false; end if;
  delete from consultation_outbox where lead_id = p_lead_id or project_id = target_project_id;
  delete from public_previews where project_id = target_project_id;
  delete from project_access_tokens where project_id = target_project_id;
  delete from projects where id = target_project_id;
  delete from leads where id = p_lead_id;
  delete from calculation_snapshots where id = target_snapshot_id and not exists (select 1 from projects where calculation_snapshot_id = target_snapshot_id);
  delete from configurations where id = target_configuration_id
    and not exists (select 1 from leads where configuration_id = target_configuration_id)
    and not exists (select 1 from projects where configuration_id = target_configuration_id)
    and not exists (select 1 from calculation_snapshots where configuration_id = target_configuration_id);
  return true;
end;
$$;

create function public.delete_project_data(p_lead_id uuid)
returns table (deleted_lead_id uuid) language plpgsql security definer set search_path = public, pg_temp
as $$ begin if public.perform_privacy_delete(p_lead_id) then return query select p_lead_id; end if; end; $$;

create function public.run_pii_retention(p_cutoff timestamptz)
returns table (deleted_lead_id uuid) language plpgsql security definer set search_path = public, pg_temp
as $$
declare target_lead_id uuid;
begin
  for target_lead_id in select id from leads where created_at < p_cutoff order by created_at for update loop
    if public.perform_privacy_delete(target_lead_id) then deleted_lead_id := target_lead_id; return next; end if;
  end loop;
end;
$$;

revoke all on function public.start_lead_form_session(text, timestamptz) from public, anon, authenticated;
revoke all on function public.submit_lead_form_session(text, timestamptz) from public, anon, authenticated;
revoke all on function public.abandon_lead_form_session(text, timestamptz, text) from public, anon, authenticated;
revoke all on function public.expire_lead_form_sessions(timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.export_project_data(uuid) from public, anon, authenticated;
revoke all on function public.perform_privacy_delete(uuid) from public, anon, authenticated;
revoke all on function public.delete_project_data(uuid) from public, anon, authenticated;
revoke all on function public.run_pii_retention(timestamptz) from public, anon, authenticated;
grant execute on function public.start_lead_form_session(text, timestamptz) to service_role;
grant execute on function public.submit_lead_form_session(text, timestamptz) to service_role;
grant execute on function public.abandon_lead_form_session(text, timestamptz, text) to service_role;
grant execute on function public.expire_lead_form_sessions(timestamptz, timestamptz) to service_role;
grant execute on function public.export_project_data(uuid) to service_role;
grant execute on function public.delete_project_data(uuid) to service_role;
grant execute on function public.run_pii_retention(timestamptz) to service_role;
