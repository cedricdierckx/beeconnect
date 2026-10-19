# EarthConnect (ex-BeeConnect) — instructions pour agents

## Branche

Ne travailler **que sur `main`** (consigne permanente du propriétaire : « travaille toujours sur main »). Ne jamais créer de branche de fonctionnalité, ne jamais
pousser ailleurs que sur `main`, ne jamais faire de force-push. Toujours
`git pull --rebase origin main` avant de commencer à coder et juste avant de pousser.

## Avant de coder

- Lire `docs/DATABASE.md` pour le schéma Supabase réel (tables, colonnes, politiques RLS,
  buckets de stockage) — ne pas supposer ni deviner la structure de données.
- Parcourir `docs/chantiers/` (voir `docs/chantiers/README.md` pour le protocole complet)
  pour voir quels chantiers sont ouverts, en cours ou bloqués, et éviter de dupliquer ou
  de percuter le travail d'un autre agent.

## Travailler à plusieurs sur `main`

Plusieurs agents codent en parallèle sur ce dépôt, directement sur `main`, sans branches.
Le protocole (réserver un chantier, limiter le périmètre de fichiers touchés, committer
par petites étapes, vérifier `npx tsc --noEmit` avant de pousser, gérer les rejets de push
par rebase) est décrit dans `docs/chantiers/README.md` — le lire avant toute contribution.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript) — voir `README.md`
- [Supabase](https://supabase.com/) (base de données, authentification, stockage) —
  client typé dans `lib/supabase/client.ts`, types dans `lib/supabase/database.types.ts`

## Produit et interface

Le produit s'appelle **EarthConnect** (le nom BeeConnect ne subsiste que dans les noms
d'infrastructure : dépôt, projet Vercel, projet Supabase). Concept : « Polliniser » remplace
le « J'aime » ; graines → pollinisations → « Je me lance » → floraisons (voir `README.md`).
L'interface doit rester **très attrayante, simple d'utilisation et ludique** : réutiliser
les classes de `app/globals.css` (`card`, `btn-primary`, `btn-honey`, `btn-ghost`, `input`,
`chip`…), la palette Tailwind (`leaf`, `honey`, `petal`, `sky`, `cream`) et les composants
de `app/components/`. Textes en français, tutoiement.

## Espace administrateurs

`/admin` (coquille `app/admin/AdminShell.tsx`, onglets dans `ADMIN_SECTIONS`) n'est visible
que pour les membres de la table `admins` (`useAuth().isAdmin`) ; la protection réelle est
faite par les politiques RLS (`is_admin()`), jamais par l'interface seule. Toute nouvelle
section de l'espace s'ajoute dans `app/admin/<section>/` et dans `ADMIN_SECTIONS`. La page
« Développement du réseau » (`app/admin/developpement/`) s'appuie sur `lib/growth.ts`
(leviers, objectifs, diagnostic, plan de départ) et sur les vues `growth_funnel` /
`growth_weekly`.
