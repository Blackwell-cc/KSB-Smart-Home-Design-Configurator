import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "../supabase/migrations/0011_privacy_analytics_operations.sql"), "utf8");

test("stores abandonment state without PII and does not rely only on browser unload", () => {
  const sessionTable = migration.match(/create table lead_form_sessions[\s\S]*?\);/i)?.[0] ?? "";
  expect(migration).toMatch(/create table lead_form_sessions[\s\S]*session_id text[\s\S]*submitted_at[\s\S]*abandoned_at[\s\S]*abandonment_reason/i);
  expect(migration).toMatch(/expire_lead_form_sessions[\s\S]*started_at < p_cutoff[\s\S]*submitted_at is null/i);
  expect(migration).toMatch(/alter table lead_form_sessions enable row level security[\s\S]*revoke all[\s\S]*from public, anon, authenticated/i);
  expect(sessionTable).not.toMatch(/\b(name|phone|email|line_id|address|private_token)\b/i);
});

test("exports only the approved bundle and deletes every private relation in one transaction", () => {
  expect(migration).toMatch(/create function public\.export_project_data[\s\S]*'contact'[\s\S]*'consent'[\s\S]*'configuration'[\s\S]*'snapshot'/i);
  expect(migration).toMatch(/perform_privacy_delete[\s\S]*delete from consultation_outbox[\s\S]*delete from public_previews[\s\S]*delete from project_access_tokens[\s\S]*delete from projects[\s\S]*delete from leads[\s\S]*delete from calculation_snapshots[\s\S]*delete from configurations/i);
  expect(migration).toMatch(/create function public\.run_pii_retention[\s\S]*created_at < p_cutoff[\s\S]*for update/i);
  expect(migration).toMatch(/revoke all on function public\.export_project_data[\s\S]*revoke all on function public\.delete_project_data[\s\S]*revoke all on function public\.run_pii_retention/i);
});
