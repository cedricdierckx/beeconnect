create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

comment on table public.follows is 'Relations d''abonnement entre utilisateurs.';

create index follows_following_id_idx on public.follows (following_id);

alter table public.follows enable row level security;

create policy "Les relations d'abonnement sont visibles publiquement"
  on public.follows for select
  using (true);

create policy "Un utilisateur peut s'abonner en son nom"
  on public.follows for insert
  with check ((select auth.uid()) = follower_id);

create policy "Un utilisateur peut se désabonner en son nom"
  on public.follows for delete
  using ((select auth.uid()) = follower_id);
