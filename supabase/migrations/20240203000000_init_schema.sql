-- Create profiles for users
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text
);

-- Organizations
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references public.profiles(id) not null,
  created_at timestamptz default now()
);

-- Automations
create table if not exists public.automations (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) not null,
  name text not null,
  trigger_type text not null, -- 'COMMENT', 'STORY_MENTION'
  keyword text, -- for comments
  is_active boolean default false,
  created_at timestamptz default now()
);

-- Automation Versions (Stores the JSON for React Flow)
create table if not exists public.automation_versions (
  id uuid default gen_random_uuid() primary key,
  automation_id uuid references public.automations(id) not null,
  nodes_json jsonb not null,
  edges_json jsonb not null,
  version_number integer default 1,
  created_at timestamptz default now()
);

-- Execution Logs
create table if not exists public.execution_logs (
  id uuid default gen_random_uuid() primary key,
  automation_id uuid references public.automations(id) not null,
  instagram_user_id text, -- From Webhook
  status text not null, -- 'PENDING', 'COMPLETED', 'FAILED'
  started_at timestamptz default now()
);
