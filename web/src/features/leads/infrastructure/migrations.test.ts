import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = (file: string) => readFileSync(resolve(process.cwd(), "../supabase/migrations", file), "utf8");
const migrations = ["0001_core.sql", "0002_price_books.sql", "0003_leads_projects.sql", "0004_public_previews.sql", "0005_harden_lead_rpc.sql", "0006_normalize_snapshot_metadata.sql"].map(migration).join("\n");

test("locks private data behind RLS, typed price tables, and a service-only transactional RPC", () => {
  for (const table of ["configurations", "price_books", "price_book_entries", "calculation_snapshots", "consent_versions", "leads", "projects", "project_access_tokens"]) expect(migrations).toMatch(new RegExp(`alter table ${table} enable row level security`, "i"));
  expect(migrations).toMatch(/one_published_price_book[\s\S]*where status = 'published'/i);
  expect(migrations).toMatch(/one_active_consent[\s\S]*where active/i);
  expect(migrations).toMatch(/token_hash bytea not null unique/i);
  expect(migrations).toMatch(/create function[\s\S]*submit_lead_once[\s\S]*security definer[\s\S]*pg_advisory_xact_lock/i);
  expect(migrations).toMatch(/revoke all[\s\S]*from public, anon, authenticated/i);
  expect(migrations).toMatch(/grant execute[\s\S]*submit_lead_once[\s\S]*to service_role/i);
});

test("keeps public previews private and derives snapshot metadata from the published database record", () => {
  const previews = migration("0004_public_previews.sql"); const hardenedRpc = migration("0005_harden_lead_rpc.sql");
  expect(previews).toMatch(/create table public_previews[\s\S]*project_id uuid not null references projects\(id\)[\s\S]*slug text not null unique[\s\S]*jsonb_typeof\(public_payload\) = 'object'/i);
  expect(previews).toMatch(/alter table public_previews enable row level security[\s\S]*revoke all[\s\S]*from public, anon, authenticated[\s\S]*grant select, insert, update, delete[\s\S]*to service_role/i);
  expect(hardenedRpc).not.toMatch(/p_pricing_version|p_reference_date/i);
  expect(hardenedRpc).toMatch(/from price_books[\s\S]*status = 'published'[\s\S]*jsonb_set[\s\S]*pricingVersion[\s\S]*referenceDate/i);
  expect(hardenedRpc).toMatch(/one_active_consent|consent_versions[\s\S]*active/i);
  expect(hardenedRpc).toMatch(/pg_advisory_xact_lock/i);
});

test("removes the legacy RPC overload before granting service_role only the hardened signature", () => {
  const hardenedRpc = migration("0005_harden_lead_rpc.sql");
  expect(hardenedRpc).toMatch(/drop function public\.submit_lead_once\(uuid, integer, jsonb, uuid, text, date, jsonb, uuid, text, text, text, text, text, text, text, timestamptz\)/i);
  expect(hardenedRpc).toMatch(/revoke all on function public\.submit_lead_once\(uuid, integer, jsonb, uuid, jsonb, uuid, text, text, text, text, text, text, text, timestamptz\) from public, anon, authenticated/i);
  expect(hardenedRpc).toMatch(/grant execute on function public\.submit_lead_once\(uuid, integer, jsonb, uuid, jsonb, uuid, text, text, text, text, text, text, text, timestamptz\) to service_role/i);
  expect(hardenedRpc).not.toMatch(/grant execute on function public\.submit_lead_once\(uuid, integer, jsonb, uuid, text, date/i);
});

test("normalizes both top-level and nested estimate metadata from the published book", () => {
  const normalizedRpc = migration("0006_normalize_snapshot_metadata.sql");
  expect(normalizedRpc).toMatch(/drop function public\.submit_lead_once\(uuid, integer, jsonb, uuid, jsonb, uuid, text, text, text, text, text, text, text, timestamptz\)/i);
  expect(normalizedRpc).toMatch(/jsonb_typeof\(p_snapshot\) <> 'object'[\s\S]*jsonb_typeof\(p_snapshot->'estimate'\) <> 'object'/i);
  for (const path of ["{pricingVersion}", "{referenceDate}", "{estimate,pricingVersion}", "{estimate,referenceDate}"]) expect(normalizedRpc).toContain(`'${path}'`);
  expect((normalizedRpc.match(/jsonb_set/g) ?? []).length).toBeGreaterThanOrEqual(4);
  expect(normalizedRpc).toMatch(/revoke all on function public\.submit_lead_once\(uuid, integer, jsonb, uuid, jsonb, uuid, text, text, text, text, text, text, text, timestamptz\) from public, anon, authenticated[\s\S]*grant execute on function public\.submit_lead_once\(uuid, integer, jsonb, uuid, jsonb, uuid, text, text, text, text, text, text, text, timestamptz\) to service_role/i);
});
