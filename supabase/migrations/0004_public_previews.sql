create table public_previews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  slug text not null unique check (char_length(slug) between 12 and 100 and slug ~ '^[A-Za-z0-9_-]+$'),
  public_payload jsonb not null check (jsonb_typeof(public_payload) = 'object'),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public_previews enable row level security;
revoke all on table public_previews from public, anon, authenticated;
grant select, insert, update, delete on table public_previews to service_role;
