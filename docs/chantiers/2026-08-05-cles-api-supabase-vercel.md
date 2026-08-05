# Chantier : récupérer les clés API Supabase et les câbler sur Vercel

**Statut : Ouvert**
**Demandé le : 2026-08-05**

## Contexte

Le schéma Supabase du projet `BeeConnect Project` (réf. `jcmcpkssjobqkmdopnhj`,
région `eu-west-3`) est en place et documenté dans `docs/DATABASE.md`. Le
squelette Next.js est déployé sur Vercel (projet `beeconnect`, équipe
`cedricdierckxs-projects`) mais aucune variable d'environnement Supabase n'y
est configurée : l'application ne peut donc pas encore contacter la base de
données, ni en local ni en production.

## Actions attendues

1. Récupérer l'URL du projet et la clé publique `anon` via les outils MCP
   Supabase (`get_project_url`, `get_publishable_keys`) sur le projet
   `jcmcpkssjobqkmdopnhj`.
2. Définir ces deux valeurs comme variables d'environnement du projet Vercel
   `beeconnect` (Production **et** Preview) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redéployer le projet Vercel pour que les variables soient prises en compte.
4. Transmettre les mêmes valeurs à l'utilisateur (ou les inscrire dans un
   `.env.local` non commité) pour le développement local.

## Résultat attendu

- Variables d'environnement actives sur Vercel (Production + Preview).
- Un déploiement de production qui affiche des données réelles issues de
  Supabase (ou au minimum ne lève plus d'erreur de connexion).

## Critère de clôture

Ce fichier est mis à jour avec le statut `Clôturé`, la date, et confirmation
que les variables sont bien définies sur Vercel (sans jamais y coller la
valeur de la clé en clair dans ce document).
