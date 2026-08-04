create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.comments is 'Commentaires laissés sur les publications.';

create index comments_post_id_idx on public.comments (post_id);
create index comments_author_id_idx on public.comments (author_id);

alter table public.comments enable row level security;

create policy "Les commentaires sont visibles publiquement"
  on public.comments for select
  using (true);

create policy "Un utilisateur peut créer ses propres commentaires"
  on public.comments for insert
  with check ((select auth.uid()) = author_id);

create policy "Un utilisateur peut modifier ses propres commentaires"
  on public.comments for update
  using ((select auth.uid()) = author_id);

create policy "Un utilisateur peut supprimer ses propres commentaires"
  on public.comments for delete
  using ((select auth.uid()) = author_id);

create trigger set_comments_updated_at
  before update on public.comments
  for each row execute procedure public.set_updated_at();
