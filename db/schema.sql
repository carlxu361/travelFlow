-- TravelFlow schema copied from SDD for direct execution in Supabase SQL Editor.
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  destination text not null,
  start_date date,
  end_date date,
  status text check (status in ('planning', 'active', 'completed')) default 'planning',
  created_at timestamptz default now()
);

create table if not exists public.days (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  day_index int not null,
  date date,
  summary text
);

create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  day_id uuid references public.days(id) on delete cascade not null,
  trip_id uuid references public.trips(id) not null,
  start_time time,
  end_time time,
  is_time_flexible boolean default false,
  title text not null,
  description text,
  category text check (category in ('spot', 'food', 'hotel', 'transport', 'custom')),
  location_name text,
  address text,
  geo_point geography(point),
  external_link text,
  is_completed boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.memories (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id),
  trip_id uuid references public.trips(id),
  type text check (type in ('image', 'text', 'voice')),
  content_url text,
  text_content text,
  created_at timestamptz default now()
);
