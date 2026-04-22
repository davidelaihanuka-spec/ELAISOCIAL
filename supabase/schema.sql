create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text default '',
  email text default '',
  website text default '',
  address text default '',
  contact_name text default '',
  notes text default '',
  receipt_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.client_packages (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null references public.clients(id) on delete cascade,
  name text default '',
  total_videos integer default 0,
  price numeric default 0,
  start_date date,
  end_date date,
  payment_status text default 'unpaid',
  paid_amount numeric default 0,
  receipt_sent boolean default false,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.projects (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id text references public.clients(id) on delete set null,
  client_name text default '',
  name text not null,
  type text default 'reel',
  stage text default 'script',
  deadline date,
  price numeric default 0,
  payment_status text default 'unpaid',
  paid_amount numeric default 0,
  notes text default '',
  drive_url text default '',
  progress integer default 0,
  is_archived boolean default false,
  archived_at timestamptz,
  is_part_of_package boolean default false,
  package_slot integer,
  files jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.scripts (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id text references public.clients(id) on delete set null,
  project_id text references public.projects(id) on delete set null,
  client_name text default '',
  title text not null,
  status text default 'draft',
  shoot_date date,
  scene text default '',
  voiceover text default '',
  camera text default '',
  edit_notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.shoot_days (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id text references public.clients(id) on delete set null,
  client_name text default '',
  date date not null,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id text references public.clients(id) on delete set null,
  client_name text default '',
  project_id text references public.projects(id) on delete set null,
  project_name text default '',
  title text not null,
  notes text default '',
  due_date date,
  status text default 'open',
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.payment_entries (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id text references public.clients(id) on delete set null,
  project_id text references public.projects(id) on delete set null,
  package_id text references public.client_packages(id) on delete set null,
  amount numeric default 0,
  paid_at date,
  method text default '',
  note text default '',
  receipt text,
  receipt_name text default '',
  receipt_type text default '',
  receipt_path text,
  created_at timestamptz default now()
);

create table if not exists public.tracking_entries (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id text references public.projects(id) on delete cascade,
  platform text default 'instagram',
  tracked_at timestamptz default now(),
  url text default '',
  views integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  saves integer default 0,
  reach integer default 0,
  notes text default '',
  created_at timestamptz default now()
);

create table if not exists public.activity_entries (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  type text default 'update',
  entity_type text default 'activity',
  entity_id text,
  message text not null,
  project_name text default '',
  client_name text default '',
  created_at timestamptz default now()
);

create table if not exists public.archive_items (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_type text default 'item',
  name text default '',
  payload jsonb default '{}'::jsonb,
  archived_at timestamptz default now()
);

create table if not exists public.trash_items (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_type text default 'item',
  name text default '',
  payload jsonb default '{}'::jsonb,
  deleted_at timestamptz default now()
);

alter table public.clients enable row level security;
alter table public.client_packages enable row level security;
alter table public.projects enable row level security;
alter table public.scripts enable row level security;
alter table public.shoot_days enable row level security;
alter table public.tasks enable row level security;
alter table public.payment_entries enable row level security;
alter table public.tracking_entries enable row level security;
alter table public.activity_entries enable row level security;
alter table public.archive_items enable row level security;
alter table public.trash_items enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'clients',
    'client_packages',
    'projects',
    'scripts',
    'shoot_days',
    'tasks',
    'payment_entries',
    'tracking_entries',
    'activity_entries',
    'archive_items',
    'trash_items'
  ]
  loop
    execute format('drop policy if exists "%1$s_owner_select" on public.%1$s', tbl);
    execute format('drop policy if exists "%1$s_owner_write" on public.%1$s', tbl);
    execute format('create policy "%1$s_owner_select" on public.%1$s for select using (auth.uid() = owner_id)', tbl);
    execute format('create policy "%1$s_owner_write" on public.%1$s for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id)', tbl);
  end loop;
end $$;
