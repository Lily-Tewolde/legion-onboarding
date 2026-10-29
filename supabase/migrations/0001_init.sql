-- Onboarding schema. From docs/build-brief.md, section 3.
-- No table is readable or writable from the browser: row-level security is on
-- with no policies for anon or authenticated, and only service_role (the
-- secret key, used on the server) has grants.

-- Progress for a visitor on one device (no free text, ever)
create table public.onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  anon_id text not null unique,            -- random id kept in a first-party cookie
  person_id uuid,                          -- set when details are saved
  current_screen text not null default 'facts',
  pay_method text check (pay_method in ('insurance','self_pay')),
  plan_id text,
  fit_result text check (fit_result in ('eligible','screened_out','crisis')),
  screen_out_reason text check (screen_out_reason in ('under_18','not_in_texas','medicaid_medicare','hospital_stay')),
  concern_labels text[],                   -- standard English labels only
  provider_id text,
  slot_start timestamptz,
  booked_at timestamptz,
  visit_outcome text check (visit_outcome in ('completed','no_show')),
  intake_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The made-up person behind a session (from the checkout's details section)
create table public.people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text not null,
  consented_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Rate limiting for the AI routes (no content)
create table public.ai_calls (
  id bigint generated always as identity primary key,
  anon_id text not null,
  route text not null,
  cost_usd numeric(10,6) not null default 0, -- estimated from token counts, for the daily cap
  created_at timestamptz not null default now()
);
create index ai_calls_anon_recent on public.ai_calls (anon_id, created_at desc);
create index ai_calls_recent on public.ai_calls (created_at desc);

alter table public.onboarding_sessions enable row level security;
alter table public.people enable row level security;
alter table public.ai_calls enable row level security;
revoke all on public.onboarding_sessions, public.people, public.ai_calls from anon, authenticated;
grant select, insert, update on public.onboarding_sessions, public.people to service_role;
grant select, insert on public.ai_calls to service_role;
grant usage on sequence public.ai_calls_id_seq to service_role;
