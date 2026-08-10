-- Local/staging QA baseline only. NOT APPROVED for customer estimates.
-- Deliberately incomplete: one province, no approver and failed golden-case gate.

begin;

insert into price_books (id, version, status, reference_date, approved_by, approved_at)
values ('00000000-0000-4000-8000-000000000101', 'TH-2026Q2-QA-0.1', 'review', date '2026-06-30', null, null)
on conflict do nothing;

insert into price_book_entries (price_book_id, entry_type, entry_key, payload, source_label)
select book.id, entry.entry_type, entry.entry_key, entry.payload, 'QA ONLY — synthetic baseline pending KSB calibration'
from price_books book
cross join (values
  ('province-rate', '10', '{"low":23700,"expected":28600,"high":33500}'::jsonb),
  ('material-factor', 'select', '{"value":0.78}'::jsonb),
  ('material-factor', 'premium', '{"value":1.0}'::jsonb),
  ('material-factor', 'signature', '{"value":1.3}'::jsonb),
  ('floor-factor', '1', '{"value":1.0}'::jsonb),
  ('floor-factor', '2', '{"value":1.04}'::jsonb),
  ('floor-factor', '3', '{"value":1.1}'::jsonb),
  ('site-access-factor', 'normal', '{"value":1.0}'::jsonb),
  ('site-access-factor', 'restricted', '{"value":1.04}'::jsonb),
  ('site-access-factor', 'very-restricted', '{"value":1.1}'::jsonb),
  ('site-risk', 'normal', '{"low":0,"expected":0,"high":150000}'::jsonb),
  ('site-risk', 'restricted', '{"low":100000,"expected":250000,"high":500000}'::jsonb),
  ('site-risk', 'very-restricted', '{"low":300000,"expected":700000,"high":1500000}'::jsonb),
  ('feature-allowance', 'pool', '{"low":800000,"expected":1200000,"high":2000000}'::jsonb),
  ('feature-allowance', 'lift', '{"low":900000,"expected":1300000,"high":1800000}'::jsonb),
  ('feature-allowance', 'smart-home', '{"low":150000,"expected":350000,"high":800000}'::jsonb),
  ('feature-allowance', 'solar', '{"low":180000,"expected":300000,"high":500000}'::jsonb),
  ('feature-allowance', 'ev-charger', '{"low":35000,"expected":65000,"high":120000}'::jsonb),
  ('feature-allowance', 'double-volume', '{"low":150000,"expected":350000,"high":700000}'::jsonb),
  ('feature-allowance', 'large-glazing', '{"low":250000,"expected":600000,"high":1500000}'::jsonb),
  ('design-fee-rates', 'default', '{"low":0.05,"expected":0.0675,"high":0.085}'::jsonb),
  ('tax-rate', 'default', '{"value":0}'::jsonb),
  ('area-catalog', 'default', '{"bedroomM2":14,"bathroomM2":5,"livingDiningBaseM2":28,"livingDiningPerResidentM2":2,"entryStorageM2":8,"kitchenM2":14,"serviceM2":9,"circulationPerFloorM2":20,"officeM2":12,"elderlyRoomM2":16,"thaiKitchenM2":12,"multipurposeRoomM2":15,"coveredParkingPerSpaceM2":15,"coveredServiceM2":4}'::jsonb)
) as entry(entry_type, entry_key, payload)
where book.version = 'TH-2026Q2-QA-0.1'
  and book.status = 'review'
  and book.approved_at is null
on conflict (price_book_id, entry_type, entry_key) do nothing;

insert into price_book_reviews (price_book_id, golden_cases_passed, golden_case_results, source_records, approved_by, approved_at)
select id, false, '[]'::jsonb, '[]'::jsonb, null, null
from price_books
where version = 'TH-2026Q2-QA-0.1' and status = 'review'
on conflict (price_book_id) do nothing;

commit;
