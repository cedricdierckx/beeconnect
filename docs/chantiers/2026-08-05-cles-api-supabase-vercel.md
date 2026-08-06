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

## Nouvelle tentative — 2026-08-06

Cette session dispose d'un accès MCP Supabase fonctionnel sur le projet
`jcmcpkssjobqkmdopnhj` (contrairement à la session précédente) : l'URL et la
clé `anon` ont été reconfirmées et sont correctes dans `.env.local`.

Le connecteur MCP Vercel a également été activé pour cette conversation,
avec accès confirmé au projet `beeconnect`
(id `prj_X1lDMjxvSAsYFbVBOieAPgN0YOpV`, équipe `cedricdierckxs-projects`,
id `team_6VGvDqwtDoFbxiAx0Yi0LvBR`, dernier déploiement production `READY`).

**Constat** : la surface d'outils exposée par ce connecteur MCP Vercel ne
contient aucun moyen de lire ou d'écrire des variables d'environnement de
projet (uniquement : projets, déploiements, protection de déploiement,
analytics web, logs runtime, achats, recherche documentaire). Le blocage
n'est donc plus un problème d'autorisation ou de connexion, mais une
limite structurelle de l'outillage actuellement disponible — confirmé à
100 % après recherche exhaustive des outils du connecteur.

**Statut : toujours Bloqué.** Ce chantier ne peut être clôturé que par :
- l'utilisateur, manuellement, dans Vercel → projet `beeconnect` →
  Settings → Environment Variables (Production **et** Preview) :
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://jcmcpkssjobqkmdopnhj.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = valeur `anon` du projet Supabase
    (Project Settings → Data API dans Supabase, ou déjà présente dans
    `.env.local` en local) — puis un redéploiement ; ou
- un futur agent disposant d'un outillage Vercel exposant la gestion des
  variables d'environnement (CLI `vercel env add`, jeton d'API Vercel
  utilisable via appel HTTP direct, ou un connecteur MCP plus complet).
