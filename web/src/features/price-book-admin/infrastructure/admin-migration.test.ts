import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "../supabase/migrations/0010_price_book_admin.sql"), "utf8");

test("keeps the admin directory and review evidence service-only", () => {
  expect(migration).toMatch(/create table admin_users[\s\S]*role text not null[\s\S]*pricing-admin[\s\S]*pricing-approver/i);
  expect(migration).toMatch(/create table price_book_reviews[\s\S]*golden_cases_passed boolean[\s\S]*golden_case_results jsonb[\s\S]*source_records jsonb/i);
  for (const table of ["admin_users", "price_book_reviews"]) expect(migration).toMatch(new RegExp(`alter table ${table} enable row level security[\\s\\S]*revoke all on table ${table} from public, anon, authenticated`, "i"));
});

test("publishes and retires atomically while blocking direct mutation of immutable books", () => {
  expect(migration).toMatch(/create function public\.publish_price_book[\s\S]*security definer[\s\S]*for update[\s\S]*set status = 'retired'[\s\S]*set status = 'published'/i);
  expect(migration).toMatch(/array_length[\s\S]*77/i);
  for (const gate of ["province-rate", "material-factor", "feature-allowance", "golden_cases_passed"]) expect(migration).toContain(gate);
  expect(migration).toMatch(/pg_advisory_xact_lock/i);
  for (const requiredEntry of ["floor-factor", "site-access-factor", "site-risk", "design-fee-rates", "tax-rate", "area-catalog"]) expect(migration).toContain(requiredEntry);
  expect(migration).toMatch(/jsonb_array_elements\(review\.source_records\)[\s\S]*jsonb_array_elements\(review\.golden_case_results\)/i);
  expect(migration).toMatch(/invalid_price_book_entry/i);
  expect(migration).toMatch(/create trigger price_books_immutable_guard[\s\S]*create trigger price_book_entries_immutable_guard/i);
  expect(migration).toMatch(/revoke all on function public\.publish_price_book[\s\S]*grant execute[\s\S]*to service_role/i);
});
