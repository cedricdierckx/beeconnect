-- EarthConnect : suppression de compte par l'utilisateur lui-même (RGPD art. 17,
-- exigence Google Play). À appliquer via l'éditeur SQL de la console Supabase : le MCP
-- refuse les instructions visant auth.users sans confirmation interactive.

-- Supprime le compte de l'utilisateur connecté. La cascade efface profil, graines,
-- floraisons, commentaires, pollinisations, intentions, vues, abonnements, blocages et
-- signalements émis. Les fichiers de Storage sont effacés par l'appli avant l'appel
-- (l'API Storage est la seule voie autorisée pour supprimer des objets).
create function public.delete_my_account()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Non authentifié';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

comment on function public.delete_my_account() is
  'Supprime définitivement le compte de l''appelant (auth.users → cascade sur toutes ses données).';
