# Base de données EarthConnect (Supabase)

Ce document décrit l'état réel de la base de données Supabase du projet, afin que tout
agent ou développeur puisse coder contre ce schéma **sans avoir accès à la console
Supabase**. Il fait foi tant qu'il n'a pas été mis à jour en même temps qu'une nouvelle
migration dans `supabase/migrations/`.

Dernière vérification en direct sur le projet : 2026-10-12. Statut : schéma appliqué
(migrations EarthConnect incluses), 0 avertissement de sécurité (`get_advisors`), RLS
activée sur toutes les tables `public`, vues en `security_invoker`.

> Le produit s'appelle désormais **EarthConnect**. Les noms d'infrastructure restent
> ceux d'origine : projet Supabase `BeeConnect Project`, projet Vercel `beeconnect`,
> dépôt GitHub `beeconnect`.
>
> Le projet Supabase (offre gratuite) se met en pause après une période d'inactivité :
> si l'application ne charge plus aucune donnée, vérifier son statut (`get_project`) et
> le relancer (`restore_project`).

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
         ├── posts (author_id → profiles.id ; parent_id → posts.id pour une floraison)
         │      ├── post_stats (post_id → posts.id, 1-1, compteurs maintenus par déclencheurs)
         │      ├── comments (post_id → posts.id, author_id → profiles.id)
         │      ├── pollinations (post_id → posts.id, user_id → profiles.id)
         │      ├── intentions (post_id → posts.id, user_id → profiles.id, bloom_post_id → posts.id)
         │      └── post_views (post_id → posts.id, viewer_id → profiles.id)
         ├── follows (follower_id → profiles.id, following_id → profiles.id)
         ├── blocks (blocker_id → profiles.id, blocked_id → profiles.id)
         └── reports (reporter_id → profiles.id ; cible : post_id | comment_id | profile_id)

Vues (lecture seule) : profile_stats, ecosystem_stats, category_stats, global_stats
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

Publications : une **graine** (`kind = 'seed'`, action originale partagée) ou une
**floraison** (`kind = 'bloom'`, reproduction confirmée d'une graine, `parent_id` renseigné).

| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| `id` | `uuid` | PK, défaut `gen_random_uuid()` | |
| `author_id` | `uuid` | FK → `profiles.id` (`on delete cascade`), NOT NULL | |
| `title` | `text` | nullable, 1 à 120 caractères | Titre court de l'action |
| `content` | `text` | NOT NULL, `check (char_length(content) > 0)` | Texte de la publication |
| `image_url` | `text` | nullable | URL publique dans le bucket `post-images` |
| `category` | `text` | nullable | Identifiant libre ; l'appli utilise la liste `CATEGORIES` de `lib/earth.ts` (`biodiversite`, `potager`, `compost`, `eau`, `nettoyage`, `mobilite`, `dechets`, `energie`, `arbres`, `autre`) |
| `kind` | `text` | NOT NULL, défaut `'seed'`, `check in ('seed','bloom')` | Graine ou floraison |
| `parent_id` | `uuid` | nullable, FK → `posts.id` (`on delete set null`) | Pour une floraison : la graine d'origine. Jointure PostgREST : `parent:posts!parent_id(...)` |
| `location` | `text` | nullable | Commune/quartier (écosystème local) |
| `created_at` | `timestamptz` | défaut `now()` | |
| `updated_at` | `timestamptz` | défaut `now()`, maintenu par déclencheur | |

Index : `posts_author_id_idx`, `posts_created_at_idx` (desc), `posts_parent_id_idx`, `posts_category_idx`.

À chaque insertion, une ligne `post_stats` est créée (déclencheur `on_post_created_stats`).
Une floraison incrémente `blooms_count` de sa graine et crée/complète automatiquement
l'intention correspondante (déclencheur `posts_bloom_stats`).

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

### `pollinations` (ex-`likes`)

« Polliniser » remplace le « J'aime » : « cette idée est utile, elle mérite de voyager ».
La table `likes` d'origine a été **renommée** (colonnes, clé et politiques conservées).

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `post_id` | `uuid` | FK → `posts.id` (`on delete cascade`), PK (composite) |
| `user_id` | `uuid` | FK → `profiles.id` (`on delete cascade`), PK (composite) |
| `created_at` | `timestamptz` | défaut `now()` |

**RLS** : `SELECT` public ; `INSERT` / `DELETE` : `auth.uid() = user_id`.
Pour éviter une erreur de doublon : `upsert(..., { onConflict: "post_id,user_id", ignoreDuplicates: true })`.

### `intentions` (« Je me lance »)

| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| `post_id` | `uuid` | FK → `posts.id` (`cascade`), PK composite | Graine que l'utilisateur veut reproduire |
| `user_id` | `uuid` | FK → `profiles.id` (`cascade`), PK composite | |
| `bloom_post_id` | `uuid` | nullable, FK → `posts.id` (`set null`) | Floraison publiée ; `null` = « en germination » |
| `created_at` | `timestamptz` | défaut `now()` | |

**RLS** : `SELECT` public ; `INSERT` / `UPDATE` / `DELETE` : `auth.uid() = user_id`.
`bloom_post_id` est renseigné automatiquement à la publication de la floraison.

### `post_views` (« personnes touchées »)

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `post_id` | `uuid` | FK → `posts.id` (`cascade`), PK composite |
| `viewer_id` | `uuid` | FK → `profiles.id` (`cascade`), PK composite |
| `created_at` | `timestamptz` | défaut `now()` |

Une vue par personne authentifiée et par publication. **RLS** : `INSERT` et `SELECT`
limités à `auth.uid() = viewer_id` (qui a vu quoi n'est pas public ; seuls les compteurs
de `post_stats` le sont). Les visiteurs anonymes ne sont pas comptés.

### `post_stats` (compteurs d'impact)

| Colonne | Type | Description |
| --- | --- | --- |
| `post_id` | `uuid` PK, FK → `posts.id` (`cascade`) | Relation 1-1 : `stats:post_stats(...)` |
| `views_count` | `int` | Personnes touchées |
| `pollinations_count` | `int` | Pollinisations |
| `intentions_count` | `int` | « Je me lance » (y compris ceux qui ont fleuri) |
| `blooms_count` | `int` | Floraisons (réalisations confirmées) |
| `comments_count` | `int` | Commentaires |

**RLS** : `SELECT` public, **aucune** politique d'écriture : seuls les déclencheurs
`security definer` (`bump_post_stat`, `handle_bloom`, `create_post_stats`) la modifient.

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

### `reports` (signalements — DSA art. 16, exigence Google Play)

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `reporter_id` | `uuid` | FK → `profiles.id` (`cascade`), NOT NULL |
| `post_id` / `comment_id` / `profile_id` | `uuid` | FK (`cascade`) ; **exactement une** cible renseignée (`reports_one_target`) |
| `reason` | `text` | `spam`, `harcelement`, `haine`, `violence`, `sexuel`, `illegal`, `desinformation`, `vie_privee`, `autre` |
| `details` | `text` | facultatif, ≤ 1000 caractères |
| `status` | `text` | `open` (défaut), `reviewed`, `actioned`, `dismissed` |
| `created_at` | `timestamptz` | défaut `now()` |

**RLS** : `INSERT` et `SELECT` limités à `auth.uid() = reporter_id`. Aucun rôle modérateur
dans l'appli : l'éditeur traite les signalements dans la console Supabase (Table Editor,
filtre `status = open`) et met à jour `status`. Conservation : 12 mois maximum après
traitement (engagement de la politique de confidentialité — purge manuelle à ce stade).

### `blocks` (membres bloqués)

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `blocker_id` | `uuid` | FK → `profiles.id` (`cascade`), PK composite |
| `blocked_id` | `uuid` | FK → `profiles.id` (`cascade`), PK composite ; `blocks_no_self_block` |
| `created_at` | `timestamptz` | défaut `now()` |

**RLS** : `SELECT` / `INSERT` / `DELETE` limités à `auth.uid() = blocker_id` (liste privée).
Le masquage des contenus bloqués est fait côté appli (`useAuth().blocked`).

## Fonctions et déclencheurs

- `public.set_updated_at()` : déclencheur générique (`before update`) qui met à jour la
  colonne `updated_at` à `now()`. Attaché à `profiles`, `posts`, `comments`.
- `public.handle_new_user()` : `security definer`, déclenché par `on_auth_user_created`
  (`after insert on auth.users`). Crée automatiquement la ligne `profiles` correspondante
  en reprenant `username`, `full_name`, `avatar_url` depuis `raw_user_meta_data` si fournis
  lors du `signUp()`. **Non exposée via l'API REST/RPC** (`execute` révoqué pour `anon` et
  `authenticated`) : elle ne doit jamais être appelée directement depuis le code applicatif.

- `public.create_post_stats()`, `public.bump_post_stat(<colonne>)`, `public.handle_bloom()` :
  `security definer`, maintiennent `post_stats` (et l'intention liée à une floraison).
  `execute` révoqué pour `anon`/`authenticated` : jamais appelées depuis l'application.

- `public.delete_my_account()` : `security definer`, exécutable par `authenticated` uniquement.
  Supprime la ligne `auth.users` de l'appelant ; la cascade efface toutes ses données. Les
  fichiers Storage sont supprimés **avant** par l'appli (`lib/account.ts`, API Storage).
  ⚠️ Migration `20261012120100_earthconnect_delete_my_account.sql` **à appliquer via
  Supabase → SQL Editor** : le connecteur MCP n'aboutit pas (instruction visant
  `auth.users`, confirmation interactive requise). Tant qu'elle manque, la suppression de
  compte affiche un message invitant à écrire à l'adresse de contact.

## Vues (lecture seule, `security_invoker = on`)

| Vue | Contenu |
| --- | --- |
| `profile_stats` | Par profil (`profile_id`) : `seeds_count`, `blooms_count`, `pollinations_given`, `intentions_count`, `blooms_inspired` (floraisons d'autres membres issues de ses graines), `followers_count`, `following_count`. Sert au statut (voir `levelFor`/`pollenPoints` dans `lib/earth.ts`). Pas de relation PostgREST vers `profiles` : faire une 2ᵉ requête `profiles.in("id", ids)`. |
| `ecosystem_stats` | Par localité (`initcap(trim(location))`) : graines, floraisons, pollinisations, vues, membres |
| `category_stats` | Par catégorie : graines, floraisons, pollinisations |
| `global_stats` | Une ligne : totaux de la plateforme |

## Authentification (Supabase Auth)

- Inscription par e-mail + mot de passe avec **confirmation par e-mail**. `signUp` passe
  `emailRedirectTo = <origine>/feed` ; ce lien n'est accepté que s'il figure dans
  Supabase → Authentication → URL Configuration → **Redirect URLs**, sinon Supabase
  redirige vers la **Site URL**. Réglages attendus :
  - Site URL : `https://beeconnect-eight.vercel.app`
  - Redirect URLs : `https://beeconnect-eight.vercel.app/**`, `http://localhost:3000/**`
- Ces réglages ne sont **pas** modifiables via le MCP Supabase (console uniquement).
- Modèles d'e-mails aux couleurs d'EarthConnect : `supabase/templates/` (voir son
  `README.md` pour l'installation dans la console). Leurs liens mènent à `/auth/confirm`
  (vérification `verifyOtp` au clic), `/reset` et `/reset/update` gèrent le mot de passe oublié.
- Un lien d'e-mail au format par défaut de Supabase déjà utilisé (ou pré-ouvert par un antivirus) renvoie
  `#error=access_denied&error_code=otp_expired` : géré par `app/components/AuthLinkHandler.tsx`
  (message + redirection vers `/login?lien=expire`, avec bouton « Renvoyer l'e-mail »).

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
  .select("*, author:profiles!posts_author_id_fkey(username, avatar_url)")
  .order("created_at", { ascending: false });

// Créer une publication (l'utilisateur doit être authentifié)
const { data: session } = await supabase.auth.getUser();
await supabase.from("posts").insert({
  author_id: session.user!.id,
  title: "Hôtel à insectes",
  content: "Construit avec les élèves 🐝",
  category: "biodiversite",
});

// Polliniser une publication
await supabase.from("pollinations").insert({ post_id, user_id: session.user!.id });

// Requête complète du fil : voir POST_SELECT dans lib/posts.ts
// author:profiles!posts_author_id_fkey(...), stats:post_stats(...), parent:posts!parent_id(...)
// ⚠️ Depuis `posts`, toujours préciser `!posts_author_id_fkey` : sans ce suffixe, PostgREST
// renvoie « more than one relationship was found for 'posts' and 'profiles' » (liens
// indirects via pollinations, intentions, post_views, comments).
```

Les types stricts (`Database`, `Tables<'posts'>`, etc.) sont disponibles depuis
`lib/supabase/database.types.ts` pour toute requête typée.

## Ce qui n'existe pas (volontairement, à ce stade)

- Pas de notifications ni de messagerie privée.
- Pas de modération (signalement de contenu) ni de rôles (admin/modérateur, compte « commune »).
- `posts.category` est un champ texte libre (liste gérée côté appli), pas une table normalisée.
- Pas de recherche plein texte ; pas d'estimation chiffrée de l'impact environnemental.
- Les vues anonymes ne sont pas comptées dans `views_count`.

## Diagnostic

`GET /api/health` (application déployée) exécute chaque forme de requête utilisée par
l'appli et renvoie `ok` ou le message d'erreur PostgREST — utile pour vérifier une
jointure ou une vue sans accès à la console.

Toute évolution de schéma doit passer par une nouvelle migration dans
`supabase/migrations/`, puis une régénération des types (`generate_typescript_types`) et
une mise à jour de ce document.
