# Chantier : refonte EarthConnect (concept « Polliniser ») et MVP complet

**Statut : Clôturé**
**Clôturé le : 2026-10-12**
**Créé le : 2026-10-12**

## Périmètre

Ce chantier englobe les cinq chantiers ouverts du 2026-08-05 (authentification,
navigation-layout, fil-publications, commentaires-et-likes, profil-et-abonnements),
réservés en même temps, ainsi que :

- `supabase/migrations/` (nouvelles migrations : pollinisations, intentions d'agir,
  floraisons, vues), `lib/supabase/database.types.ts`, `docs/DATABASE.md`
- toute l'arborescence `app/` et `lib/`, `package.json` (ajout de Tailwind CSS)
- `README.md`, `CLAUDE.md` (renommage BeeConnect → EarthConnect)

## Contexte

Le projet est renommé **EarthConnect** (document de concept « New Idea Network ») :
réseau social centré sur l'action environnementale positive. Le « J'aime » est remplacé
par **Polliniser** ; une publication est une **graine**, une intention de reproduire
l'action est « **Je me lance** », une réalisation confirmée est une **floraison**.
Statuts utilisateurs : Explorateur → Pollinisateur → Pollinisateur local → Grand
Pollinisateur → Gardien de l'écosystème.

Les noms techniques d'infrastructure (dépôt GitHub `beeconnect`, projet Vercel
`beeconnect`, projet Supabase `BeeConnect Project`) restent inchangés à ce stade.

## Actions attendues

1. Schéma : remplacer `likes` par `pollinations`, ajouter `intentions`, `post_views`,
   colonnes de graine/floraison sur `posts`, vue de statistiques.
2. UI attractive, simple et ludique : accueil, fil, création de graine, détail d'une
   graine (chaîne d'impact), profil + édition, connexion/inscription.
3. Documentation mise à jour.

## Résultat attendu

MVP déployé sur Vercel depuis `main`, `npx tsc --noEmit` et `next build` passent.

## Résolution

- **Supabase** : projet réactivé (il était en pause). Migrations
  `20261012090000_earthconnect_pollinisation.sql` (likes → pollinations par renommage,
  intentions, post_views, post_stats + déclencheurs, colonnes title/kind/parent_id/location,
  vues profile_stats / ecosystem_stats) et `20261012100000_earthconnect_impact_views.sql`
  (global_stats, category_stats). Testé par un bloc SQL annulé en fin d'exécution (compteurs,
  rattachement floraison → intention, RLS) ; 0 avertissement de sécurité. Types régénérés.
- **Interface** (Tailwind) : accueil, fil (Tout / Mon écosystème + catégories), plantation
  de graine ou de floraison avec photo redimensionnée, détail avec chaîne d'impact,
  profil avec statut et progression, édition de profil + avatar, tableau d'impact,
  connexion / inscription, notifications « toast », animation de pollinisation, bulle
  d'explication à la première visite, célébration après publication.
- **Next.js** 14.2.5 → 14.2.35 (correctifs de sécurité). ESLint configuré.
- `docs/DATABASE.md`, `README.md`, `CLAUDE.md` mis à jour.

## Pistes ouvertes (non réalisées)

- Notifications (« ta graine a fleuri chez @x »).
- Comptes « organisation / commune » avec tableau de bord filtré sur leur territoire.
- Modération (signalement) et estimation chiffrée de l'impact environnemental.
- Réglage Supabase Auth → URL Configuration : Site URL = domaine de production Vercel
  (sinon les liens de confirmation d'e-mail pointent vers `localhost`).
