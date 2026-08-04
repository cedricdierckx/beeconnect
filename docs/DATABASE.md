# Base de données BeeConnect (Supabase)

Ce document décrit l'état réel de la base de données Supabase du projet, afin que tout
agent ou développeur puisse coder contre ce schéma **sans avoir accès à la console
Supabase**. Il fait foi tant qu'il n'a pas été mis à jour en même temps qu'une nouvelle
migration dans `supabase/migrations/`.

Dernière vérification en direct sur le projet : 2026-08-04. Statut : schéma appliqué,
0 avertissement de sécurité (`get_advisors`), RLS activée sur toutes les tables `public`.

- Projet Supabase : `BeeConnect Project` (réf. `jcmcpkssjobqkmdopnhj`, région `eu-west-3`)
- Source de vérité versionnée : `supabase/migrations/*.sql`
- Types TypeScript générés : `lib/supabase/database.types.ts`
- Client applicatif typé : `lib/supabase/client.ts` (`createClient<Database>(...)`)

## Variables d'environnement requises

Définies dans `.env.local` (non commité, voir `.env.example`) :

```
NEXT_PUBLIC_SUPABASE_URL=https://jcmcpkssjobqkmdopnhj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon du projet, disponible dans Supabase > Project Settings > API>
```

Ces deux valeurs sont publiques par nature (utilisées côté navigateur) ; elles ne donnent
accès qu'aux opérations autorisées par les politiques RLS ci-dessous. Aucune clé
`service_role` n'est utilisée dans ce projet.

## Vue d'ensemble des relations

```
auth.users (géré par Supabase Auth)
   └── profiles (id = auth.users.id)
         ├── posts (author_id → profiles.id)
         │      ├── comments (post_id → posts.id, author_id → profiles.id)
         │      └── likes (post_id → posts.id, user_id → profiles.id)
         └── follows (follower_id → profiles.id, following_id → profiles.id)
```

Un profil est créé **automatiquement** à l'inscription d'un utilisateur via un
déclencheur (`on_auth_user_created`) sur `auth.users`. Le code applicatif n'a jamais
besoin d'insérer manuellement dans `profiles` après un `supabase.auth.signUp()`.

## Tables

### `profiles`

Profil public de chaque utilisateur.

| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | PK, FK → `auth.users.id` (`on delete cascade`) | Identique à l'id d'authentification |
| `username` | `text` | `unique`, nullable | Pseudonyme, à renseigner par l'utilisateur (non garanti à l'inscription) |
| `full_name` | `text` | nullable | Alimenté depuis `raw_user_meta_data->>'full_name'` à l'inscription si fourni |
| `avatar_url` | `text` | nullable | URL publique dans le bucket `avatars` |
| `bio` | `text` | nullable | |
| `location` | `text` | nullable | |
| `created_at` | `timestamptz` | défaut `now()` | |
| `updated_at` | `timestamptz` | défaut `now()`, maintenu par déclencheur | Mis à jour automatiquement à chaque `UPDATE` |

**RLS** : activée.
- `SELECT` : public (`true`) — tout profil est lisible par tous, y compris anonymes.
- `INSERT` : `auth.uid() = id` — un utilisateur ne peut créer que son propre profil (en pratique déjà fait par le déclencheur d'inscription).
- `UPDATE` : `auth.uid() = id` — un utilisateur ne peut modifier que son propre profil.
- Pas de politique `DELETE` explicite : la suppression se fait uniquement en cascade via la suppression du compte `auth.users`.

### `posts`

Publications des utilisateurs.

| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | PK, défaut `gen_random_uuid()` | |
| `author_id` | `uuid` | FK → `profiles.id` (`on delete cascade`), NOT NULL | |
| `content` | `text` | NOT NULL, `check (char_length(content) > 0)` | Texte de la publication |
| `image_url` | `text` | nullable | URL publique dans le bucket `post-images` |
| `category` | `text` | nullable | Tag libre (ex. thématique écologique) ; pas d'énumération contrainte à ce stade |
| `created_at` | `timestamptz` | défaut `now()` | |
| `updated_at` | `timestamptz` | défaut `now()`, maintenu par déclencheur | |

Index : `posts_author_id_idx`, `posts_created_at_idx` (desc, utile pour un fil chronologique).

**RLS** : activée.
- `SELECT` : public.
- `INSERT` : `auth.uid() = author_id`.
- `UPDATE` / `DELETE` : `auth.uid() = author_id`.

### `comments`

| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | PK, défaut `gen_random_uuid()` | |
| `post_id` | `uuid` | FK → `posts.id` (`on delete cascade`), NOT NULL | |
| `author_id` | `uuid` | FK → `profiles.id` (`on delete cascade`), NOT NULL | |
| `content` | `text` | NOT NULL, `check (char_length(content) > 0)` | |
| `created_at` | `timestamptz` | défaut `now()` | |
| `updated_at` | `timestamptz` | défaut `now()`, maintenu par déclencheur | |

Index : `comments_post_id_idx`, `comments_author_id_idx`.

**RLS** : activée — mêmes règles que `posts` (lecture publique, écriture réservée à l'auteur).

### `likes`

Table de liaison (pas d'`id` propre, clé composite).

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `post_id` | `uuid` | FK → `posts.id` (`on delete cascade`), PK (composite) |
| `user_id` | `uuid` | FK → `profiles.id` (`on delete cascade`), PK (composite) |
| `created_at` | `timestamptz` | défaut `now()` |

Un utilisateur ne peut liker deux fois la même publication (contrainte de clé primaire).

**RLS** : activée.
- `SELECT` : public.
- `INSERT` : `auth.uid() = user_id`.
- `DELETE` : `auth.uid() = user_id` (retirer son propre like).

### `follows`

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `follower_id` | `uuid` | FK → `profiles.id` (`on delete cascade`), PK (composite) |
| `following_id` | `uuid` | FK → `profiles.id` (`on delete cascade`), PK (composite) |
| `created_at` | `timestamptz` | défaut `now()` |

Contrainte `follows_no_self_follow check (follower_id <> following_id)` : un utilisateur
ne peut pas s'abonner à lui-même.

**RLS** : activée.
- `SELECT` : public.
- `INSERT` : `auth.uid() = follower_id`.
- `DELETE` : `auth.uid() = follower_id`.

## Fonctions et déclencheurs

- `public.set_updated_at()` : déclencheur générique (`before update`) qui met à jour la
  colonne `updated_at` à `now()`. Attaché à `profiles`, `posts`, `comments`.
- `public.handle_new_user()` : `security definer`, déclenché par `on_auth_user_created`
  (`after insert on auth.users`). Crée automatiquement la ligne `profiles` correspondante
  en reprenant `username`, `full_name`, `avatar_url` depuis `raw_user_meta_data` si fournis
  lors du `signUp()`. **Non exposée via l'API REST/RPC** (`execute` révoqué pour `anon` et
  `authenticated`) : elle ne doit jamais être appelée directement depuis le code applicatif.

## Stockage (Storage)

Deux buckets publics en lecture :

| Bucket | Public | Convention de chemin | Écriture autorisée |
| --- | --- | --- | --- |
| `avatars` | oui | `{user_id}/nom-de-fichier.ext` | uniquement le propriétaire du dossier (`auth.uid() = premier segment du chemin`) |
| `post-images` | oui | `{user_id}/nom-de-fichier.ext` | idem |

Exemple d'upload côté client :

```ts
const filePath = `${user.id}/${crypto.randomUUID()}.jpg`;
await supabase.storage.from("avatars").upload(filePath, file);
const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
// data.publicUrl → à stocker dans profiles.avatar_url
```

Toute tentative d'upload en dehors de son propre dossier (`{user_id}/...`) est rejetée par
la politique RLS de `storage.objects`.

## Exemples d'utilisation côté code

```ts
import { supabase } from "@/lib/supabase/client";

// Fil de publications le plus récent, avec l'auteur
const { data: posts } = await supabase
  .from("posts")
  .select("*, profiles(username, avatar_url)")
  .order("created_at", { ascending: false });

// Créer une publication (l'utilisateur doit être authentifié)
const { data: session } = await supabase.auth.getUser();
await supabase.from("posts").insert({
  author_id: session.user!.id,
  content: "Mon expérience zéro déchet du jour 🐝",
});

// Liker une publication
await supabase.from("likes").insert({ post_id, user_id: session.user!.id });
```

Les types stricts (`Database`, `Tables<'posts'>`, etc.) sont disponibles depuis
`lib/supabase/database.types.ts` pour toute requête typée.

## Ce qui n'existe pas (volontairement, à ce stade)

- Pas de notifications, messagerie privée, ni système de badges/gamification.
- Pas de modération (signalement de contenu) ni de rôles (admin/modérateur).
- `posts.category` est un simple champ texte libre, pas une table de catégories normalisée.
- Pas de recherche plein texte (index `pg_trgm`/`tsvector`) configurée.

Toute évolution de schéma doit passer par une nouvelle migration dans
`supabase/migrations/`, puis une régénération des types (`generate_typescript_types`) et
une mise à jour de ce document.
