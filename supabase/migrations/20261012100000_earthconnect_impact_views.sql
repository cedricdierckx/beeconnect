-- EarthConnect : agrégats globaux et par catégorie pour la page « Impact ».

create view public.global_stats
with (security_invoker = on) as
select
  (select count(*) from public.posts where kind = 'seed')::int as seeds_count,
  (select count(*) from public.posts where kind = 'bloom')::int as blooms_count,
  (select count(*) from public.pollinations)::int as pollinations_count,
  (select count(*) from public.intentions)::int as intentions_count,
  (select coalesce(sum(views_count), 0) from public.post_stats)::int as views_count,
  (select count(*) from public.profiles)::int as members_count;

comment on view public.global_stats is 'Compteurs d''impact globaux de la plateforme (une seule ligne).';

create view public.category_stats
with (security_invoker = on) as
select
  coalesce(p.category, 'autre') as category,
  count(*) filter (where p.kind = 'seed')::int as seeds_count,
  count(*) filter (where p.kind = 'bloom')::int as blooms_count,
  coalesce(sum(s.pollinations_count), 0)::int as pollinations_count
from public.posts p
left join public.post_stats s on s.post_id = p.id
group by coalesce(p.category, 'autre');

comment on view public.category_stats is 'Dynamisme par catégorie d''action (graines, floraisons, pollinisations).';
