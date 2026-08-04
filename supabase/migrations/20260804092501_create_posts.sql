create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) > 0),
  image_url text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.posts is 'Publications partagées par les utilisateurs de BeeConnect.';

create index posts_author_id_idx on public.posts (author_id);
create index posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

create policy "Les publications sont visibles publiquement"
  on public.posts for select
  using (true);

create policy "Un utilisateur peut créer ses propres publications"
  on public.posts for insert
  with check ((select auth.uid()) = author_id);

create policy "Un utilisateur peut modifier ses propres publications"
  on public.posts for update
  using ((select auth.uid()) = author_id);

create policy "Un utilisateur peut supprimer ses propres publications"
  on public.posts for delete
  using ((select auth.uid()) = author_id);

create trigger set_posts_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();
