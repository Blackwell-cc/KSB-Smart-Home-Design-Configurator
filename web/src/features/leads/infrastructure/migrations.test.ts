import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migrations = ["0001_core.sql", "0002_price_books.sql", "0003_leads_projects.sql"].map((file) => readFileSync(resolve(process.cwd(), "../supabase/migrations", file), "utf8")).join("\n");

test("locks private data behind RLS, typed price tables, and a service-only transactional RPC", () => {
  for (const table of ["configurations", "price_books", "price_book_entries", "calculation_snapshots", "consent_versions", "leads", "projects", "project_access_tokens"]) expect(migrations).toMatch(new RegExp(`alter table ${table} enable row level security`, "i"));
  expect(migrations).toMatch(/one_published_price_book[\s\S]*where status = 'published'/i);
  expect(migrations).toMatch(/one_active_consent[\s\S]*where active/i);
  expect(migrations).toMatch(/token_hash bytea not null unique/i);
  expect(migrations).toMatch(/create function[\s\S]*submit_lead_once[\s\S]*security definer[\s\S]*pg_advisory_xact_lock/i);
  expect(migrations).toMatch(/revoke all[\s\S]*from public, anon, authenticated/i);
  expect(migrations).toMatch(/grant execute[\s\S]*submit_lead_once[\s\S]*to service_role/i);
});
