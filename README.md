# BeeConnect

Réseau social axé sur l'écologie et le partage d'expériences.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Supabase](https://supabase.com/) pour la base de données, l'authentification et le stockage

## Base de données Supabase

Le projet Supabase associé (`BeeConnect Project`, région `eu-west-3`) expose le schéma suivant dans `public`, avec Row Level Security activée sur chaque table :

| Table | Description | Accès |
| --- | --- | --- |
| `profiles` | Profil public de chaque utilisateur (créé automatiquement à l'inscription via un déclencheur sur `auth.users`) | Lecture publique, écriture par le propriétaire |
| `posts` | Publications (contenu, image, catégorie écologique) | Lecture publique, écriture par l'auteur |
| `comments` | Commentaires sur les publications | Lecture publique, écriture par l'auteur |
| `likes` | Mentions « j'aime » sur les publications | Lecture publique, écriture par l'utilisateur concerné |
| `follows` | Relations d'abonnement entre utilisateurs | Lecture publique, écriture par l'abonné |

Deux buckets de stockage publics sont également configurés : `avatars` et `post-images` (chemin attendu : `{user_id}/nom-de-fichier`).

Les migrations SQL versionnées se trouvent dans `supabase/migrations/`. Pour les rejouer sur un autre projet avec la CLI Supabase :

```
supabase link --project-ref <project-ref>
supabase db push
```

Les types TypeScript générés depuis le schéma sont dans `lib/supabase/database.types.ts` et utilisés par le client dans `lib/supabase/client.ts`.

📖 **Référence complète du schéma** (colonnes, contraintes, politiques RLS exactes, buckets, exemples de requêtes) : voir [`docs/DATABASE.md`](docs/DATABASE.md). À lire avant de coder une fonctionnalité touchant aux données — la base est déjà en place, il n'est pas nécessaire d'y accéder directement pour connaître son fonctionnement.

## Développement local

1. Copier `.env.example` vers `.env.local` et renseigner les clés Supabase (URL du projet et clé publique `anon`, disponibles dans les paramètres API du projet Supabase).
2. `npm install`
3. `npm run dev`
