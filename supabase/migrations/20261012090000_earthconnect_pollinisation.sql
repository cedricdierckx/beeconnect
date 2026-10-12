-- EarthConnect : passage du « J'aime » à la pollinisation, chaîne graine → floraison.
-- Voir docs/DATABASE.md pour la description fonctionnelle.

-- 1. Publications : graines et floraisons -------------------------------------------

alter table public.posts
  add column title text check (title is null or char_length(title) between 1 and 120),
  add column kind text not null default 'seed' check (kind in ('seed', 'bloom')),
  add column parent_id uuid references public.posts (id) on delete set null,
  add column location text;

comment on table public.posts is
  'Publications EarthConnect : une graine (action partagée) ou une floraison (reproduction confirmée d''une graine).';
comment on column public.posts.kind is '''seed'' = graine (action originale), ''bloom'' = floraison (reproduction).';
comment on column public.posts.parent_id is 'Pour une floraison : la graine dont elle est issue.';

create index posts_parent_id_idx on public.posts (parent_id);
create index posts_category_idx on public.posts (category);

-- 2. Pollinisations (remplacent les « j'aime ») ------------------------------------

-- La table `likes` est renommée (et non supprimée) : mêmes colonnes, même clé composite.
alter table public.likes rename to pollinations;
alter table public.pollinations rename constraint likes_pkey to pollinations_pkey;
alter table public.pollinations rename constraint likes_post_id_fkey to pollinations_post_id_fkey;
alter table public.pollinations rename constraint likes_user_id_fkey to pollinations_user_id_fkey;
alter index public.likes_post_id_idx rename to pollinations_post_id_idx;
alter index public.likes_user_id_idx rename to pollinations_user_id_idx;

comment on table public.pollinations is
  'Pollinisations : « cette idée est utile, elle mérite de voyager ».';

alter policy "Les mentions j'aime sont visibles publiquement" on public.pollinations
  rename to "Les pollinisations sont visibles publiquement";
alter policy "Un utilisateur peut aimer une publication en son nom" on public.pollinations
  rename to "Un utilisateur peut polliniser en son nom";
alter policy "Un utilisateur peut retirer sa propre mention j'aime" on public.pollinations
  rename to "Un utilisateur peut retirer sa pollinisation";

-- 3. Intentions d'agir (« Je me lance ») ------------------------------------------

create table public.intentions (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  bloom_post_id uuid references public.posts (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

comment on table public.intentions is
  'Intentions d''agir (« Je me lance ») ; bloom_post_id est renseigné quand la réalisation est publiée.';

create index intentions_user_id_idx on public.intentions (user_id);
create index intentions_bloom_post_id_idx on public.intentions (bloom_post_id);

alter table public.intentions enable row level security;

create policy "Les intentions sont visibles publiquement"
  on public.intentions for select
  using (true);

create policy "Un utilisateur peut se lancer en son nom"
  on public.intentions for insert
  with check ((select auth.uid()) = user_id);

create policy "Un utilisateur peut modifier ses intentions"
  on public.intentions for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Un utilisateur peut retirer ses intentions"
  on public.intentions for delete
  using ((select auth.uid()) = user_id);

-- 4. Vues (« personnes touchées ») -------------------------------------------------

create table public.post_views (
  post_id uuid not null references public.posts (id) on delete cascade,
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, viewer_id)
);

comment on table public.post_views is
  'Personnes (authentifiées) ayant vu une publication. Non lisible publiquement : seuls les compteurs de post_stats le sont.';

create index post_views_viewer_id_idx on public.post_views (viewer_id);

alter table public.post_views enable row level security;

create policy "Un utilisateur enregistre ses propres vues"
  on public.post_views for insert
  with check ((select auth.uid()) = viewer_id);

create policy "Un utilisateur voit ses propres vues"
  on public.post_views for select
  using ((select auth.uid()) = viewer_id);

-- 5. Compteurs d'impact par publication -------------------------------------------

create table public.post_stats (
  post_id uuid primary key references public.posts (id) on delete cascade,
  views_count integer not null default 0,
  pollinations_count integer not null default 0,
  intentions_count integer not null default 0,
  blooms_count integer not null default 0,
  comments_count integer not null default 0
);

comment on table public.post_stats is
  'Compteurs d''impact maintenus par déclencheurs : touchés, pollinisations, intentions, floraisons, commentaires.';

alter table public.post_stats enable row level security;

create policy "Les statistiques sont visibles publiquement"
  on public.post_stats for select
  using (true);

-- Aucune politique d'écriture : seuls les déclencheurs (security definer) écrivent.

create function public.create_post_stats()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.post_stats (post_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_post_created_stats
  after insert on public.posts
  for each row execute procedure public.create_post_stats();

create function public.bump_post_stat()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target uuid;
  delta integer;
  col text := tg_argv[0];
begin
  if tg_op = 'INSERT' then
    target := new.post_id;
    delta := 1;
  else
    target := old.post_id;
    delta := -1;
  end if;

  execute format(
    'update public.post_stats set %1$I = greatest(%1$I + $1, 0) where post_id = $2',
    col
  ) using delta, target;

  return null;
end;
$$;

create trigger pollinations_stats
  after insert or delete on public.pollinations
  for each row execute procedure public.bump_post_stat('pollinations_count');

create trigger intentions_stats
  after insert or delete on public.intentions
  for each row execute procedure public.bump_post_stat('intentions_count');

create trigger post_views_stats
  after insert or delete on public.post_views
  for each row execute procedure public.bump_post_stat('views_count');

create trigger comments_stats
  after insert or delete on public.comments
  for each row execute procedure public.bump_post_stat('comments_count');

-- Floraisons : compteur de la graine parente + rattachement automatique de l'intention.
create function public.handle_bloom()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') and new.kind = 'bloom' and new.parent_id is not null then
    if tg_op = 'INSERT' or old.parent_id is distinct from new.parent_id or old.kind <> 'bloom' then
      update public.post_stats set blooms_count = blooms_count + 1 where post_id = new.parent_id;
      insert into public.intentions (post_id, user_id, bloom_post_id)
      values (new.parent_id, new.author_id, new.id)
      on conflict (post_id, user_id) do update set bloom_post_id = excluded.bloom_post_id;
    end if;
  end if;

  if tg_op in ('UPDATE', 'DELETE') and old.kind = 'bloom' and old.parent_id is not null then
    if tg_op = 'DELETE' or old.parent_id is distinct from new.parent_id or new.kind <> 'bloom' then
      update public.post_stats set blooms_count = greatest(blooms_count - 1, 0)
      where post_id = old.parent_id;
    end if;
  end if;

  return null;
end;
$$;

create trigger posts_bloom_stats
  after insert or update of kind, parent_id or delete on public.posts
  for each row execute procedure public.handle_bloom();

revoke execute on function public.create_post_stats() from anon, authenticated, public;
revoke execute on function public.bump_post_stat() from anon, authenticated, public;
revoke execute on function public.handle_bloom() from anon, authenticated, public;

-- Statistiques des publications déjà existantes.
insert into public.post_stats (post_id, comments_count)
select p.id, (select count(*) from public.comments c where c.post_id = p.id)
from public.posts p
on conflict do nothing;

-- 6. Statistiques par profil (statut de pollinisateur) ----------------------------

create view public.profile_stats
with (security_invoker = on) as
select
  pr.id as profile_id,
  (select count(*) from public.posts p where p.author_id = pr.id and p.kind = 'seed')::int as seeds_count,
  (select count(*) from public.posts p where p.author_id = pr.id and p.kind = 'bloom')::int as blooms_count,
  (select count(*) from public.pollinations po where po.user_id = pr.id)::int as pollinations_given,
  (select count(*) from public.intentions i where i.user_id = pr.id)::int as intentions_count,
  (select count(*) from public.posts b
     join public.posts s on s.id = b.parent_id
     where s.author_id = pr.id and b.kind = 'bloom' and b.author_id <> pr.id)::int as blooms_inspired,
  (select count(*) from public.follows f where f.following_id = pr.id)::int as followers_count,
  (select count(*) from public.follows f where f.follower_id = pr.id)::int as following_count
from public.profiles pr;

comment on view public.profile_stats is
  'Indicateurs par profil servant à calculer le statut (Explorateur → Gardien de l''écosystème).';

-- 7. Écosystèmes (agrégats par localité) ------------------------------------------

create view public.ecosystem_stats
with (security_invoker = on) as
select
  initcap(trim(p.location)) as location,
  count(*) filter (where p.kind = 'seed')::int as seeds_count,
  count(*) filter (where p.kind = 'bloom')::int as blooms_count,
  coalesce(sum(s.pollinations_count), 0)::int as pollinations_count,
  coalesce(sum(s.views_count), 0)::int as views_count,
  count(distinct p.author_id)::int as members_count
from public.posts p
left join public.post_stats s on s.post_id = p.id
where p.location is not null and trim(p.location) <> ''
group by initcap(trim(p.location));

comment on view public.ecosystem_stats is
  'Agrégats d''impact par localité (écosystèmes locaux) — base du tableau de bord des communes.';
