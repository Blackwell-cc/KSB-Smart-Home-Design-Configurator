create table price_books (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  status text not null check (status in ('draft', 'review', 'published', 'retired')),
  reference_date date not null,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  check ((status = 'published') = (approved_at is not null))
);

create unique index one_published_price_book on price_books ((status)) where status = 'published';

create table price_book_entries (
  id uuid primary key default gen_random_uuid(),
  price_book_id uuid not null references price_books(id) on delete restrict,
  entry_type text not null check (entry_type in ('province-rate', 'material-factor', 'floor-factor', 'site-access-factor', 'site-risk', 'feature-allowance', 'design-fee-rates', 'tax-rate', 'area-catalog')),
  entry_key text not null check (char_length(entry_key) between 1 and 120),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  source_label text not null check (char_length(source_label) between 1 and 240),
  unique (price_book_id, entry_type, entry_key)
);

alter table price_books enable row level security;
alter table price_book_entries enable row level security;
