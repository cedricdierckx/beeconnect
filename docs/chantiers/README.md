# Chantiers pour agent avec accès MCP Supabase

Cette session travaille uniquement sur `main` et n'a pas accès au serveur MCP
Supabase. Toute opération qui nécessite cet accès (lecture de clés API,
migration de schéma, gestion des buckets, politiques RLS, etc.) est déposée
ici sous forme de fiche « chantier », à traiter par un agent qui dispose de
cet accès.

## Cycle de vie d'un chantier

1. Un chantier est créé dans `docs/chantiers/AAAA-MM-JJ-titre.md` avec le
   statut `Ouvert`.
2. L'agent MCP traite le chantier, effectue les actions demandées, puis met à
   jour le fichier : statut `Clôturé`, résultat obtenu, et documentation
   annexe mise à jour si nécessaire (ex. `docs/DATABASE.md`).
3. Le fichier reste dans l'historique du dépôt à titre de traçabilité ; il
   n'est pas supprimé après clôture.

Aucune clé secrète ne doit être écrite en clair dans un chantier ou committée
dans le dépôt.
