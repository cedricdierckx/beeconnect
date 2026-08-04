create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil public associé à chaque utilisateur authentifié.';

alter table public.profiles enable row level security;

create policy "Les profils sont visibles publiquement"
  on public.profiles for select
  using (true);

create policy "Un utilisateur peut créer son propre profil"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

create policy "Un utilisateur peut modifier son propre profil"
  on public.profiles for update
  using ((select auth.uid()) = id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
