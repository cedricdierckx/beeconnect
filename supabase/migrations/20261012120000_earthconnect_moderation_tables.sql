-- EarthConnect : modération (signalements, blocages) et droits RGPD (suppression de compte).
-- Exigences Google Play pour les applis à contenu généré par les utilisateurs + DSA (art. 16).

-- 1. Signalements -----------------------------------------------------------------

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete cascade,
  reason text not null check (reason in ('spam', 'harcelement', 'haine', 'violence', 'sexuel', 'illegal', 'desinformation', 'vie_privee', 'autre')),
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz not null default now(),
  constraint reports_one_target check (num_nonnulls(post_id, comment_id, profile_id) = 1)
);

comment on table public.reports is
  'Signalements de contenus ou de profils (DSA art. 16). Traités par l''éditeur via la console Supabase.';

create index reports_status_idx on public.reports (status, created_at desc);
create index reports_reporter_id_idx on public.reports (reporter_id);
create index reports_post_id_idx on public.reports (post_id);
create index reports_comment_id_idx on public.reports (comment_id);
create index reports_profile_id_idx on public.reports (profile_id);

alter table public.reports enable row level security;

create policy "Un utilisateur signale en son nom"
  on public.reports for insert
  with check ((select auth.uid()) = reporter_id);

create policy "Un utilisateur voit ses propres signalements"
  on public.reports for select
  using ((select auth.uid()) = reporter_id);

-- 2. Blocages ---------------------------------------------------------------------

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_no_self_block check (blocker_id <> blocked_id)
);

comment on table public.blocks is
  'Membres bloqués : leurs contenus sont masqués pour celui qui bloque. Liste privée.';

create index blocks_blocked_id_idx on public.blocks (blocked_id);

alter table public.blocks enable row level security;

create policy "Un utilisateur voit ses propres blocages"
  on public.blocks for select
  using ((select auth.uid()) = blocker_id);

create policy "Un utilisateur bloque en son nom"
  on public.blocks for insert
  with check ((select auth.uid()) = blocker_id);

create policy "Un utilisateur débloque en son nom"
  on public.blocks for delete
  using ((select auth.uid()) = blocker_id);
