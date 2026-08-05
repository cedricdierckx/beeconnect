# Chantier : récupérer les clés API Supabase et les câbler sur Vercel

**Statut : Clôturé partiellement**
**Demandé le : 2026-08-05**
**Clôturé le : 2026-08-05**

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

## Résolution

L'accès MCP Supabase de cette session ne voit pas le projet `jcmcpkssjobqkmdopnhj`
(compte/organisation différent de celui connecté). Impossible également de
définir une variable d'environnement Vercel persistante : aucun outil MCP
Vercel disponible dans cette session ne le permet.

Contournement appliqué :
- L'utilisateur a transmis directement l'URL et la clé `anon` (récupérées
  dans Supabase → Project Settings → Data API).
- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` ont été
  ajoutées dans `.env.local` (non commité) pour le développement local.
- Un nouveau déploiement de production a été déclenché en embarquant ces
  deux valeurs dans un `.env.production` fourni uniquement à l'outil de
  déploiement (jamais commité au dépôt). Déploiement `READY` confirmé.

## Reste à faire (hors de portée de cette session)

Ce déploiement fonctionne, mais les variables ne sont **pas** enregistrées
de façon persistante dans les paramètres du projet Vercel. Tout futur
déploiement déclenché autrement que par cette procédure manuelle (ex. via
Git une fois le repo lié) n'aura pas ces variables tant qu'elles n'auront
pas été ajoutées dans Vercel → Project Settings → Environment Variables.
Un agent disposant de l'outillage Vercel adéquat (ou l'utilisateur,
manuellement) doit clôturer ce point pour une clôture complète.
