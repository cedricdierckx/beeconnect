-- EarthConnect : espace administrateurs.
-- 1. Rôle administrateur (table `admins`, fonction `is_admin()`), désigné par l'éditeur via la
--    console Supabase (aucune écriture possible depuis l'application).
-- 2. Les administrateurs voient et traitent tous les signalements.
-- 3. Développement du réseau : objectifs chiffrés (`growth_goals`) et plan d'actions
--    (`growth_actions`), réservés aux administrateurs.
-- 4. Vues d'analyse (`growth_funnel`, `growth_weekly`) : agrégats anonymes calculés sur des
--    tables déjà publiques en lecture ; `open_reports` ne se remplit que pour un administrateur.

-- 1. Administrateurs ---------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Administrateurs de la plateforme. Désignés uniquement par l''éditeur (console Supabase) : aucune politique d''écriture.';

alter table public.admins enable row level security;

-- Vérifie si l'utilisateur connecté est administrateur. `security definer` pour que la
-- lecture de `admins` dans les politiques RLS ne dépende pas de la politique de `admins`.
create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Exécutable aussi par `anon` (renvoie simplement faux) : les politiques RLS qui l'appellent
-- (reports, growth_*) sont évaluées pour tout rôle qui lit ces tables ou vues.
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

comment on function public.is_admin() is 'Vrai si l''appelant figure dans public.admins.';

create policy "Un membre voit son rôle, un administrateur voit la liste"
  on public.admins for select
  using ((select auth.uid()) = user_id or (select public.is_admin()));

-- 2. Signalements : lecture et traitement par les administrateurs ---------------------

create policy "Les administrateurs voient tous les signalements"
  on public.reports for select
  using ((select public.is_admin()));

create policy "Les administrateurs traitent les signalements"
  on public.reports for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- 3. Développement du réseau ---------------------------------------------------------

create table public.growth_goals (
  id uuid primary key default gen_random_uuid(),
  metric text not null check (metric in (
    'members', 'active_30d', 'seeds', 'blooms', 'pollinations', 'intentions', 'ecosystems', 'bloom_rate'
  )),
  target numeric not null check (target > 0),
  deadline date,
  label text check (label is null or char_length(label) <= 120),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.growth_goals is
  'Objectifs chiffrés de développement du réseau (espace administrateurs). La valeur courante est calculée par l''appli.';

create table public.growth_actions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  details text check (details is null or char_length(details) <= 2000),
  lever text not null check (lever in (
    'acquisition', 'activation', 'retention', 'referral', 'impact', 'partnership'
  )),
  status text not null default 'idea' check (status in ('idea', 'planned', 'in_progress', 'done', 'dropped')),
  impact smallint not null default 2 check (impact between 1 and 3),
  effort smallint not null default 2 check (effort between 1 and 3),
  owner text check (owner is null or char_length(owner) <= 80),
  due_date date,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.growth_actions is
  'Plan de développement du réseau : actions par levier (acquisition, activation, rétention, parrainage, impact, partenariats).';

create index growth_actions_status_idx on public.growth_actions (status, created_at desc);

create trigger growth_goals_set_updated_at
  before update on public.growth_goals
  for each row execute function public.set_updated_at();

create trigger growth_actions_set_updated_at
  before update on public.growth_actions
  for each row execute function public.set_updated_at();

alter table public.growth_goals enable row level security;
alter table public.growth_actions enable row level security;

create policy "Objectifs réservés aux administrateurs"
  on public.growth_goals for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Plan d'actions réservé aux administrateurs"
  on public.growth_actions for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- 4. Vues d'analyse ------------------------------------------------------------------

-- Parcours des membres : combien d'inscrits franchissent chaque étape (comptes distincts).
create view public.growth_funnel
with (security_invoker = on) as
with actors as (
  select author_id as user_id, created_at from public.posts
  union all select author_id, created_at from public.comments
  union all select user_id, created_at from public.pollinations
  union all select user_id, created_at from public.intentions
)
select
  (select count(*) from public.profiles)::int as members,
  (select count(*) from public.profiles where created_at >= now() - interval '7 days')::int as new_7d,
  (select count(*) from public.profiles where created_at >= now() - interval '30 days')::int as new_30d,
  (select count(*) from public.profiles where username is not null)::int as with_username,
  (select count(*) from public.profiles where avatar_url is not null or bio is not null)::int as with_profile,
  (select count(*) from public.profiles where location is not null)::int as with_location,
  (select count(distinct follower_id) from public.follows)::int as following_someone,
  (select count(distinct user_id) from public.pollinations)::int as pollinated,
  (select count(distinct user_id) from public.intentions)::int as intended,
  (select count(distinct author_id) from public.posts where kind = 'seed')::int as planted,
  (select count(distinct author_id) from public.posts where kind = 'bloom')::int as bloomed,
  (select count(distinct user_id) from actors where created_at >= now() - interval '7 days')::int as active_7d,
  (select count(distinct user_id) from actors where created_at >= now() - interval '30 days')::int as active_30d,
  (select count(distinct a.user_id) from actors a
     join public.profiles p on p.id = a.user_id
     where a.created_at >= now() - interval '30 days' and p.created_at < now() - interval '30 days')::int as returning_30d,
  (select count(*) from public.posts where kind = 'seed')::int as seeds,
  (select count(*) from public.posts where kind = 'seed' and location is not null)::int as seeds_with_location,
  (select count(*) from public.posts where kind = 'seed' and image_url is not null)::int as seeds_with_image,
  (select count(*) from public.posts where kind = 'bloom')::int as blooms,
  (select count(*) from public.pollinations)::int as pollinations,
  (select count(*) from public.intentions)::int as intentions,
  (select count(*) from public.intentions where bloom_post_id is null)::int as germinating,
  (select count(distinct initcap(trim(location))) from public.posts where location is not null and trim(location) <> '')::int as ecosystems,
  (select count(*) from public.reports where status = 'open')::int as open_reports;

comment on view public.growth_funnel is
  'Entonnoir d''activation et compteurs de développement (une seule ligne, agrégats anonymes).';

-- Rythme hebdomadaire sur les 16 dernières semaines (semaines ISO, lundi).
create view public.growth_weekly
with (security_invoker = on) as
with weeks as (
  select generate_series(
    date_trunc('week', now()) - interval '15 weeks',
    date_trunc('week', now()),
    interval '1 week'
  ) as week_start
),
actors as (
  select author_id as user_id, created_at from public.posts
  union all select author_id, created_at from public.comments
  union all select user_id, created_at from public.pollinations
  union all select user_id, created_at from public.intentions
)
select
  w.week_start::date as week_start,
  (select count(*) from public.profiles p where date_trunc('week', p.created_at) = w.week_start)::int as new_members,
  (select count(distinct user_id) from actors a where date_trunc('week', a.created_at) = w.week_start)::int as active_members,
  (select count(*) from public.posts p where p.kind = 'seed' and date_trunc('week', p.created_at) = w.week_start)::int as seeds,
  (select count(*) from public.posts p where p.kind = 'bloom' and date_trunc('week', p.created_at) = w.week_start)::int as blooms,
  (select count(*) from public.pollinations x where date_trunc('week', x.created_at) = w.week_start)::int as pollinations,
  (select count(*) from public.intentions x where date_trunc('week', x.created_at) = w.week_start)::int as intentions
from weeks w
order by w.week_start;

comment on view public.growth_weekly is
  'Nouveaux membres, membres actifs, graines, floraisons, pollinisations et intentions par semaine (16 dernières semaines).';
