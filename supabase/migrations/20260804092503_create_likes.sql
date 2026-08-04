create table public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

comment on table public.likes is 'Mentions "j''aime" apposées par les utilisateurs sur les publications.';

create index likes_post_id_idx on public.likes (post_id);
create index likes_user_id_idx on public.likes (user_id);

alter table public.likes enable row level security;

create policy "Les mentions j'aime sont visibles publiquement"
  on public.likes for select
  using (true);

create policy "Un utilisateur peut aimer une publication en son nom"
  on public.likes for insert
  with check ((select auth.uid()) = user_id);

create policy "Un utilisateur peut retirer sa propre mention j'aime"
  on public.likes for delete
  using ((select auth.uid()) = user_id);
