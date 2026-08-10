drop function public.submit_lead_once(uuid, integer, jsonb, uuid, text, date, jsonb, uuid, text, text, text, text, text, text, text, timestamptz);

create function public.submit_lead_once(
  p_configuration_id uuid, p_schema_version integer, p_configuration jsonb,
  p_price_book_id uuid, p_snapshot jsonb, p_idempotency_key uuid,
  p_name text, p_preferred_contact_method text, p_phone text, p_email text,
  p_line_id text, p_consent_version text, p_token_hash_hex text, p_expires_at timestamptz
) returns table (lead_id uuid, project_id uuid)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare existing_lead uuid; existing_project uuid; snapshot_id uuid; active_consent boolean;
  published_version text; published_reference_date date; normalized_snapshot jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 0));
  select l.id, p.id into existing_lead, existing_project from leads l join projects p on p.lead_id = l.id where l.idempotency_key = p_idempotency_key;
  if existing_lead is not null then return query select existing_lead, existing_project; return; end if;
  select version, reference_date into published_version, published_reference_date from price_books where id = p_price_book_id and status = 'published';
  if published_version is null then raise exception 'PUBLISHED_PRICE_BOOK_UNAVAILABLE' using errcode = 'P0001'; end if;
  if jsonb_typeof(p_snapshot) <> 'object' then raise exception 'INVALID_CALCULATION_SNAPSHOT' using errcode = 'P0001'; end if;
  normalized_snapshot := jsonb_set(jsonb_set(p_snapshot, '{pricingVersion}', to_jsonb(published_version), true), '{referenceDate}', to_jsonb(to_char(published_reference_date, 'YYYY-MM-DD')), true);
  select active into active_consent from consent_versions where version = p_consent_version;
  if coalesce(active_consent, false) is not true then raise exception 'CONSENT_VERSION_INACTIVE' using errcode = 'P0001'; end if;
  insert into configurations (id, schema_version, payload) values (p_configuration_id, p_schema_version, p_configuration);
  insert into calculation_snapshots (configuration_id, price_book_id, pricing_version, reference_date, payload)
    values (p_configuration_id, p_price_book_id, published_version, published_reference_date, normalized_snapshot) returning id into snapshot_id;
  insert into leads (configuration_id, idempotency_key, name, preferred_contact_method, phone, email, line_id, consent_version)
    values (p_configuration_id, p_idempotency_key, p_name, p_preferred_contact_method, p_phone, p_email, p_line_id, p_consent_version) returning id into existing_lead;
  insert into projects (configuration_id, calculation_snapshot_id, lead_id) values (p_configuration_id, snapshot_id, existing_lead) returning id into existing_project;
  insert into project_access_tokens (project_id, token_hash, expires_at) values (existing_project, decode(p_token_hash_hex, 'hex'), p_expires_at);
  return query select existing_lead, existing_project;
end;
$$;

revoke all on function public.submit_lead_once(uuid, integer, jsonb, uuid, jsonb, uuid, text, text, text, text, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.submit_lead_once(uuid, integer, jsonb, uuid, jsonb, uuid, text, text, text, text, text, text, text, timestamptz) to service_role;
