-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null,
  description text,
  strategic_fields jsonb default '{}'::jsonb,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create blocks table
create table public.blocks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references auth.users not null,
  type text not null,
  content text,
  metadata jsonb default '{}'::jsonb,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.blocks enable row level security;

-- Create policies for projects
create policy "Users can view their own projects" 
  on public.projects for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own projects" 
  on public.projects for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own projects" 
  on public.projects for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own projects" 
  on public.projects for delete 
  using (auth.uid() = user_id);

-- Create policies for blocks
create policy "Users can view their own blocks" 
  on public.blocks for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own blocks" 
  on public.blocks for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own blocks" 
  on public.blocks for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own blocks" 
  on public.blocks for delete 
  using (auth.uid() = user_id);

-- Create function to handle updated_at
create or replace function public.handle_updated_at() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at_projects
  before update on public.projects
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at_blocks
  before update on public.blocks
  for each row
  execute procedure public.handle_updated_at();
