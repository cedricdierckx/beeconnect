# Chantier : refonte EarthConnect (concept « Polliniser ») et MVP complet

**Statut : En cours** (agent : refonte EarthConnect — MVP complet, depuis : 2026-10-12)
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
