-- Drop existing tables to ensure clean state
drop policy if exists "Users can manage their own projects" on public.projects;
drop policy if exists "Users can manage their own blocks" on public.blocks;
drop table if exists public.blocks;
drop table if exists public.projects;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects Table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null,
  description text,
  strategic_fields jsonb default '{}'::jsonb,
  tags text[] default array[]::text[],
  status text default 'Não Iniciado',
  progress integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Blocks Table
create table public.blocks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  content text,
  metadata jsonb default '{}'::jsonb,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.projects enable row level security;
alter table public.blocks enable row level security;

-- Policies
create policy "Users can manage their own projects"
  on public.projects for all
  using (auth.uid() = user_id);

create policy "Users can manage their own blocks"
  on public.blocks for all
  using (auth.uid() = user_id);
