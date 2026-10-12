# 🌍🐝 EarthConnect

**Le réseau social où les bonnes actions se pollinisent.**

Citoyens, écoles, associations, entreprises et communes y partagent ce qu'ils ont
concrètement réalisé pour l'environnement. Ici, pas de bouton « J'aime » :

| Vocabulaire | Signification |
| --- | --- |
| 🌱 **Graine** | Une action publiée (photo + description) |
| 🐝 **Polliniser** | « Cette idée est utile, elle mérite de voyager » — elle circule alors dans l'écosystème de ceux qui nous suivent |
| 🧑‍🌾 **Je me lance** | Intention de reproduire l'action chez soi |
| 🌸 **Floraison** | Réalisation confirmée (en photo), rattachée à la graine d'origine |
| 🏡 **Écosystème** | Ma communauté (membres suivis) et ma localité |
| 🌼 **Prairie d'impact** | Graine très reproduite |

Chaque graine affiche son impact réel : personnes touchées → pollinisations → intentions
d'agir → floraisons. Les membres progressent d'**Explorateur** à **Gardien de
l'écosystème** selon leur capacité à transformer l'inspiration en actions (« pollen »,
voir `lib/earth.ts`).

## Pages

| Route | Contenu |
| --- | --- |
| `/` | Présentation du concept |
| `/feed` | Fil « Tout le jardin » / « Mon écosystème », filtre par catégorie |
| `/new` | Planter une graine ; `/new?bloom=<id>` publie une floraison ; `/new?idea=<texte>` pré-remplit |
| `/seed/[id]` | Détail, chaîne d'impact, floraisons, commentaires |
| `/profile/[username]`, `/profile/edit` | Profil, statut de pollinisateur, graines/floraisons/en germination |
| `/impact` | Tableau d'impact : totaux, écosystèmes locaux, catégories, prairies, grands pollinisateurs |
| `/login`, `/signup` | Authentification Supabase (e-mail + mot de passe), âge minimum et acceptation des conditions |
| `/reset`, `/reset/update`, `/auth/confirm` | Mot de passe oublié, atterrissage des liens d'e-mail |
| `/settings` | Export des données, membres bloqués, suppression du compte |
| `/legal/*` | Conditions, confidentialité, mentions légales, suppression de compte (données éditeur : `lib/legal.ts`) |
| `/api/health` | Diagnostic des requêtes Supabase (ok / erreur, aucune donnée) |

## Stack

- [Next.js 14](https://nextjs.org/) (App Router, TypeScript), [Tailwind CSS 3](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) : base de données, authentification, stockage
- Déploiement [Vercel](https://vercel.com/) automatique à chaque push sur `main`

Les noms techniques historiques sont conservés : dépôt `beeconnect`, projet Vercel
`beeconnect`, projet Supabase `BeeConnect Project` (réf. `jcmcpkssjobqkmdopnhj`).

## Base de données

📖 Référence complète du schéma (tables, déclencheurs, vues, politiques RLS, buckets) :
[`docs/DATABASE.md`](docs/DATABASE.md). Migrations versionnées dans `supabase/migrations/`,
types générés dans `lib/supabase/database.types.ts`.

## Développement local

1. Copier `.env.example` vers `.env.local` et renseigner l'URL du projet Supabase et sa clé publique `anon`.
2. `npm install`
3. `npm run dev`

Avant de pousser : `npx tsc --noEmit` et `npm run lint`.

## Application Android (Google Play)

PWA installable publiée en Trusted Web Activity : voir [`docs/play-store/README.md`](docs/play-store/README.md)
(état des lieux, guide de publication, textes de la fiche, sécurité des données).

## Travail à plusieurs agents

Voir `CLAUDE.md` et [`docs/chantiers/README.md`](docs/chantiers/README.md).
