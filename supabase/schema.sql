-- =============================================================
-- Golden Link — Database Schema
-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- on a fresh Supabase project. Safe to re-run: it drops and recreates.
-- =============================================================

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";

-- ---------- Enums ----------
do $$ begin
  create type user_role as enum ('senior', 'family', 'volunteer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type emergency_status as enum ('active', 'resolved', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------- USER (profiles) ----------
-- One row per auth.users row. Created automatically by the trigger below.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'senior',
  full_name text not null default 'New User',
  email text,
  phone text,
  whatsapp_number text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Links a senior's account to a family member's account via a 6-digit code,
-- as described in the report (Fig. 4).
create table if not exists public.family_links (
  id uuid primary key default uuid_generate_v4(),
  senior_id uuid not null references public.profiles (id) on delete cascade,
  family_id uuid references public.profiles (id) on delete cascade,
  link_code text not null unique check (char_length(link_code) = 6),
  created_at timestamptz not null default now(),
  linked_at timestamptz
);

-- ---------- EMERGENCY MODULE ----------
create table if not exists public.emergency_contacts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  contact_name text not null,
  contact_number text not null check (contact_number ~ '^[0-9+ ]{7,15}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.emergency_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status emergency_status not null default 'active',
  latitude double precision,
  longitude double precision,
  timestamp timestamptz not null default now(),
  resolved_at timestamptz
);

-- ---------- MEDICINE MODULE ----------
create table if not exists public.medicines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  dosage text not null default '1 tablet',
  days text[] not null default array['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  reminder_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- One row every time a senior marks a dose taken/missed (adherence history).
create table if not exists public.medicine_history (
  id uuid primary key default uuid_generate_v4(),
  medicine_id uuid not null references public.medicines (id) on delete cascade,
  status text not null default 'taken' check (status in ('taken', 'missed', 'skipped')),
  taken_at timestamptz not null default now()
);

-- ---------- SERVICES MODULE ----------
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  volunteer_id uuid references public.profiles (id) on delete set null,
  name text not null,
  category text not null check (category in ('Cleaning', 'Fixing', 'Hangout', 'Plumbing', 'Electrical', 'Carpentry', 'AC Repair', 'Other')),
  address text,
  phone text,
  whatsapp_number text,
  availability text,
  rating_avg numeric(2,1) not null default 0.0,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  status booking_status not null default 'requested',
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now()
);

-- ---------- COMMUNITY MODULE ----------
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  comment_text text not null check (char_length(comment_text) between 1 and 300),
  created_at timestamptz not null default now()
);

-- =============================================================
-- Auto-create a profile row whenever someone signs up via OAuth
-- =============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'user_name', 'New User'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.profiles enable row level security;
alter table public.family_links enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.emergency_logs enable row level security;
alter table public.medicines enable row level security;
alter table public.medicine_history enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- Helper: is this uid linked to that senior as family?
create or replace function public.is_linked_family(p_senior_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.family_links
    where senior_id = p_senior_id
      and family_id = auth.uid()
      and linked_at is not null
  );
$$ language sql security definer stable;

-- profiles: everyone can read basic profile info (needed for community
-- posts, service listings), but you can only edit your own row.
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- family_links: a senior can create/view their own link codes; a family
-- member can view/claim a link addressed to them.
create policy "family_links_select" on public.family_links
  for select using (auth.uid() = senior_id or auth.uid() = family_id);
create policy "family_links_insert" on public.family_links
  for insert with check (auth.uid() = senior_id);
create policy "family_links_update" on public.family_links
  for update using (auth.uid() = senior_id or family_id is null);

-- emergency_contacts / emergency_logs: owner or linked family can view;
-- only the owner can write.
create policy "emergency_contacts_select" on public.emergency_contacts
  for select using (auth.uid() = user_id or public.is_linked_family(user_id));
create policy "emergency_contacts_write" on public.emergency_contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "emergency_logs_select" on public.emergency_logs
  for select using (auth.uid() = user_id or public.is_linked_family(user_id));
create policy "emergency_logs_write" on public.emergency_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- medicines / medicine_history: owner or linked family can view; only
-- the owner can write.
create policy "medicines_select" on public.medicines
  for select using (auth.uid() = user_id or public.is_linked_family(user_id));
create policy "medicines_write" on public.medicines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "medicine_history_select" on public.medicine_history
  for select using (
    exists (select 1 from public.medicines m where m.id = medicine_id and
      (m.user_id = auth.uid() or public.is_linked_family(m.user_id)))
  );
create policy "medicine_history_write" on public.medicine_history
  for insert with check (
    exists (select 1 from public.medicines m where m.id = medicine_id and m.user_id = auth.uid())
  );

-- services: readable by all signed-in users; only the owning volunteer
-- can edit their own listing.
create policy "services_select_all" on public.services for select using (true);
create policy "services_write_own" on public.services
  for all using (auth.uid() = volunteer_id) with check (auth.uid() = volunteer_id);

-- bookings: the requesting senior and the servicing volunteer can see it.
create policy "bookings_select" on public.bookings
  for select using (
    auth.uid() = user_id or
    auth.uid() in (select volunteer_id from public.services s where s.id = service_id)
  );
create policy "bookings_write_own" on public.bookings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reviews: readable by all; only the booking owner can write one.
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_write_own" on public.reviews
  for insert with check (
    exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
  );

-- community: posts/comments are readable by all signed-in users; only
-- the author can write/delete their own.
create policy "posts_select_all" on public.posts for select using (true);
create policy "posts_write_own" on public.posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_write_own" on public.comments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
