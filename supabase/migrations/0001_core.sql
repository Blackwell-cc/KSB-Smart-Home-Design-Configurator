create extension if not exists pgcrypto;

create table configurations (
  id uuid primary key,
  schema_version integer not null check (schema_version > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table consent_versions (
  version text primary key check (char_length(version) between 1 and 120),
  privacy_notice_url text not null,
  published_at timestamptz not null,
  active boolean not null default false
);

create unique index one_active_consent on consent_versions ((active)) where active;

alter table configurations enable row level security;
alter table consent_versions enable row level security;
