# Task 9 — Private Project Access, Full Report, PDF and Summary Image

## Scope delivered

- Fragment-only `/report/access#project=<uuid>&token=<secret>` handoff that immediately scrubs browser history, exchanges strict JSON once, and navigates only after server confirmation.
- SHA-256 token lookup, expiry/revocation/project-match checks, signed opaque HttpOnly Secure SameSite=Strict session, and session revalidation against the service-role repository on report, PDF, and consultation requests.
- Strict saved-snapshot parser and one immutable `FullReportViewModel`; it preserves all five estimate lines (including zero values), areas, pricing metadata, exclusions, and optional target-budget comparison without recalculation.
- PII-free report browser view, client-only summary PNG export with object-URL cleanup, authenticated/idempotent consultation request, and no analytics provider.
- Protected PDF generated from the same report VM, bundled local Noto Sans Thai variable TTF, SIL OFL license, and source note. The PDF render test validates `%PDF` output.

## Verification evidence

- Full suite, bounded single-worker batches: 34 test files / 175 tests passed.
  - Batch 1: 9 files / 27 tests
  - Batch 2: 8 files / 61 tests
  - Batch 3: 9 files / 69 tests
  - Batch 4: 8 files / 18 tests
- Final focused Task 9: 12 files / 25 tests passed before final constant-only refactor; the refactor regression: 2 files / 3 tests passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `git diff --check`: passed before staging.

## Runtime boundary

Supabase CLI/Docker were unavailable, so migrations and live PostgREST bytea/query behavior were not exercised against a real database. Repository contracts are injection-tested and the runtime implementation uses service-role credentials only. Production launch still needs an integration check for active/revoked/expired token reads and the idempotent consultation update against deployed Supabase.
