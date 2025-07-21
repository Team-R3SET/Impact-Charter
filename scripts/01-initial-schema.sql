-- Create user_profiles table, linking to auth.users
create table public.user_profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  avatar_url text,
  company text,
  role text,
  bio text,
  updated_at timestamp with time zone
);

-- Create business_plans table
create table public.business_plans (
  id uuid not null primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_name text not null,
  status text default 'Draft'::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create business_plan_sections table
create table public.business_plan_sections (
  id uuid not null primary key default gen_random_uuid(),
  plan_id uuid not null references public.business_plans(id) on delete cascade,
  section_name text not null,
  section_content text,
  is_complete boolean default false,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  modified_by_email text,
  unique(plan_id, section_name)
);

-- Enable Row Level Security for all tables
alter table public.user_profiles enable row level security;
alter table public.business_plans enable row level security;
alter table public.business_plan_sections enable row level security;

-- RLS Policies for user_profiles
create policy "Users can view all profiles." on public.user_profiles for select using (true);
create policy "Users can insert their own profile." on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on public.user_profiles for update using (auth.uid() = id);

-- RLS Policies for business_plans
create policy "Users can manage their own business plans." on public.business_plans for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- RLS Policies for business_plan_sections
create policy "Users can manage sections for plans they own." on public.business_plan_sections for all using (
  exists (
    select 1 from public.business_plans
    where business_plans.id = business_plan_sections.plan_id and business_plans.owner_id = auth.uid()
  )
);

-- Function to create a user profile when a new user signs up in Supabase Auth
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger to call the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
