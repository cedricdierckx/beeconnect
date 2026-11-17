# Base de données EarthConnect (Supabase)

Ce document décrit l'état réel de la base de données Supabase du projet, afin que tout
agent ou développeur puisse coder contre ce schéma **sans avoir accès à la console
Supabase**. Il fait foi tant qu'il n'a pas été mis à jour en même temps qu'une nouvelle
migration dans `supabase/migrations/`.

Dernière vérification en direct sur le projet : 2026-11-17 (schéma `beeconnect` du projet CedApps, comparé élément par élément à l'ancien `public` : 0 écart). Statut : schéma appliqué
(migrations EarthConnect et espace administrateurs incluses), RLS activée sur toutes les
tables `public`, vues en `security_invoker`. `get_advisors` (sécurité) : avertissements
attendus uniquement — `is_admin()` (exécutable par `anon`/`authenticated`, renvoie faux
pour un non-administrateur) et `delete_my_account()` (`authenticated`) sont volontairement
`security definer` ; la protection contre les mots de passe divulgués (Auth) reste à
activer dans la console.

> Le produit s'appelle désormais **EarthConnect**. Les noms d'infrastructure restent
> ceux d'origine : projet Vercel `beeconnect`, dépôt GitHub `beeconnect`, schéma Postgres
> `beeconnect`.

## Hébergement (depuis le 2026-11-17)

Les données d'EarthConnect sont dans le projet Supabase partagé **`CedApps Project`**
(réf. `gqmatjwegdepebriidif`, région `eu-west-3`, organisation « Ced Free Org », offre
gratuite), dans le **schéma `beeconnect`** — et non plus dans `public`. Chantier :
`docs/chantiers/2026-11-17-hebergement-cedapps.md`.

- Tout ce document reste exact en remplaçant `public.` par `beeconnect.` (tables, vues,
  fonctions, `search_path` des fonctions = `beeconnect`). Le client
  (`lib/supabase/client.ts`) lit le schéma dans `NEXT_PUBLIC_SUPABASE_SCHEMA`.
- Le déclencheur sur `auth.users` s'appelle `beeconnect_on_auth_user_created` et appelle
  `beeconnect.handle_new_user()`. `auth.users` est partagé avec les autres applications
  du projet CedApps (qui n'utilisent pas Auth à ce jour).
- Storage : buckets `avatars` et `post-images` du projet CedApps ; les URL publiques sont
  en `https://gqmatjwegdepebriidif.supabase.co/storage/v1/object/public/…`.
- Configuration Auth (Site URL, redirections, modèles d'e-mails de `supabase/templates/`,
  SMTP `hello@fami.team`) : portée par le projet CedApps.
- Le projet CedApps est gardé éveillé par un cron quotidien (dépôt CedApps,
  `app/api/keepalive`). S'il était malgré tout mis en pause (aucune donnée ne charge) :
  vérifier son statut (`get_project`) et le relancer (`restore_project`).
- Sauvegarde : l'offre gratuite n'en fait aucune ; un workflow GitHub du dépôt CedApps
  exporte le projet le 1er de chaque mois, chiffré, conservé 30 jours (GitHub figure
  donc parmi les sous-traitants de `lib/legal.ts`). Voir CedApps `docs/SAUVEGARDES.md`.
- Pour ajouter une migration : l'écrire pour `public` comme d'habitude dans
  `supabase/migrations/`, mais l'**appliquer au schéma `beeconnect`** du projet CedApps
  (remplacer `public.` par `beeconnect.`, `search_path = beeconnect`), en donnant les
  droits à `anon`, `authenticated`, `service_role` comme dans `public`.
- Ancien projet `BeeConnect Project` (réf. `jcmcpkssjobqkmdopnhj`) : plus utilisé depuis la
  bascule ; **en pause** depuis le 2026-11-17, intact, restaurable 90 jours (retour arrière
  décrit dans le chantier).

- Source de vérité versionnée : `supabase/migrations/*.sql` (écrites pour `public`)
- Types TypeScript générés : `lib/supabase/database.types.ts` (valables pour `beeconnect`)
- Client applicatif typé : `lib/supabase/client.ts` (`createClient<Database>(...)`)

## Variables d'environnement requises

Définies dans `.env.local` (non commité, voir `.env.example`) :

```
NEXT_PUBLIC_SUPABASE_URL=https://gqmatjwegdepebriidif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon du projet CedApps, Supabase > Project Settings > API>
# Schéma Postgres des tables : « beeconnect » dans le projet CedApps (défaut « public »,
# l'ancien projet BeeConnect).
NEXT_PUBLIC_SUPABASE_SCHEMA=beeconnect
```

La session du navigateur est toujours rangée sous la clé
`sb-jcmcpkssjobqkmdopnhj-auth-token` (`lib/supabase/client.ts`), quel que soit le projet :
après un changement de projet, une session émise par l'ancien projet est renouvelée
auprès du nouveau (jeton de rafraîchissement copié) au lieu de déconnecter le membre.

Ces valeurs sont publiques par nature (utilisées côté navigateur) ; elles ne donnent
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
         ├── reports (reporter_id → profiles.id ; cible : post_id | comment_id | profile_id)
         ├── admins (user_id → profiles.id) — rôle administrateur
         ├── growth_goals (created_by → profiles.id) — objectifs de développement (admins)
         └── growth_actions (created_by → profiles.id) — plan de développement (admins)

Vues (lecture seule) : profile_stats, ecosystem_stats, category_stats, global_stats,
growth_funnel, growth_weekly
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
| `parent_id` | `uuid` | nullable, FK → `posts.id` (`on delete set null`) | Pour une floraison : la graine d'origine. Jointure PostgREST : `parent:parent_id(...)` (⚠️ `posts!parent_id` renvoie au contraire la liste des floraisons **enfants** : le fil plantait dès qu'une floraison existait) |
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

**RLS** : `INSERT` et `SELECT` limités à `auth.uid() = reporter_id` ; en plus, `SELECT` et
`UPDATE` pour les administrateurs (`is_admin()`). L'appli n'offre pas encore d'écran de
traitement : l'éditeur traite les signalements dans la console Supabase (Table Editor,
filtre `status = open`) et met à jour `status` ; l'espace administrateurs affiche le
nombre de signalements ouverts. Conservation : 12 mois maximum après traitement
(engagement de la politique de confidentialité — purge manuelle à ce stade).

### `blocks` (membres bloqués)

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `blocker_id` | `uuid` | FK → `profiles.id` (`cascade`), PK composite |
| `blocked_id` | `uuid` | FK → `profiles.id` (`cascade`), PK composite ; `blocks_no_self_block` |
| `created_at` | `timestamptz` | défaut `now()` |

**RLS** : `SELECT` / `INSERT` / `DELETE` limités à `auth.uid() = blocker_id` (liste privée).
Le masquage des contenus bloqués est fait côté appli (`useAuth().blocked`).

### `admins` (rôle administrateur)

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `user_id` | `uuid` | PK, FK → `profiles.id` (`cascade`) |
| `note` | `text` | facultatif, ≤ 200 caractères (ex. « éditeur ») |
| `created_at` | `timestamptz` | défaut `now()` |

**RLS** : `SELECT` : sa propre ligne (`auth.uid() = user_id`) ou toutes pour un
administrateur. **Aucune politique d'écriture** : un administrateur se désigne uniquement
depuis la console Supabase (SQL Editor) :

```sql
insert into public.admins (user_id, note)
select id, 'éditeur' from auth.users where email = 'adresse@exemple.be';
-- retirer le rôle : delete from public.admins where user_id = '…';
```

L'appli lit sa propre ligne au chargement (`useAuth().isAdmin`) pour afficher le lien
« Admin » et l'espace `/admin`. La protection réelle est assurée par les politiques RLS
ci-dessous, pas par l'interface.

### `growth_goals` (objectifs de développement — administrateurs)

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `metric` | `text` | `members`, `active_30d`, `seeds`, `blooms`, `pollinations`, `intentions`, `ecosystems`, `bloom_rate` (valeur courante calculée par l'appli depuis `growth_funnel`, voir `METRICS` dans `lib/growth.ts`) |
| `target` | `numeric` | > 0 |
| `deadline` | `date` | facultatif |
| `label` | `text` | facultatif, ≤ 120 caractères |
| `created_by` | `uuid` | FK → `profiles.id` (`set null`) |
| `created_at`, `updated_at` | `timestamptz` | `updated_at` maintenu par déclencheur |

**RLS** : toutes les opérations réservées aux administrateurs (`is_admin()`).

### `growth_actions` (plan de développement — administrateurs)

| Colonne | Type | Contraintes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `title` | `text` | 1 à 160 caractères |
| `details` | `text` | facultatif, ≤ 2000 caractères |
| `lever` | `text` | `acquisition`, `activation`, `retention`, `referral`, `impact`, `partnership` (`LEVERS` dans `lib/growth.ts`) |
| `status` | `text` | `idea` (défaut), `planned`, `in_progress`, `done`, `dropped` |
| `impact`, `effort` | `smallint` | de 1 à 3 (défaut 2) ; priorité = impact × 2 + facilité |
| `owner` | `text` | facultatif, ≤ 80 caractères |
| `due_date` | `date` | facultatif |
| `created_by` | `uuid` | FK → `profiles.id` (`set null`) |
| `created_at`, `updated_at` | `timestamptz` | `updated_at` maintenu par déclencheur |

Index : `growth_actions_status_idx` (`status`, `created_at desc`).
**RLS** : toutes les opérations réservées aux administrateurs (`is_admin()`).

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

- `public.is_admin()` : `security definer`, `stable`, exécutable par `anon` (renvoie faux) et
  `authenticated`. Vrai si `auth.uid()` figure dans `admins`. Utilisée par les politiques
  RLS de `admins`, `reports`, `growth_goals`, `growth_actions` ; peut être appelée en RPC.

- `public.delete_my_account()` : `security definer`, exécutable par `authenticated` uniquement.
  Supprime la ligne `auth.users` de l'appelant ; la cascade efface toutes ses données. Les
  fichiers Storage sont supprimés **avant** par l'appli (`lib/account.ts`, API Storage).
  Migration `20261012120100_earthconnect_delete_my_account.sql` appliquée par l'éditeur via
  Supabase → SQL Editor (constaté le 2026-10-20) ; elle n'apparaît donc pas dans
  `list_migrations`. Le connecteur MCP n'aboutit pas sur ce type d'instruction (visant
  `auth.users`, confirmation interactive requise) : toute modification future de cette
  fonction passe aussi par le SQL Editor.

## Vues (lecture seule, `security_invoker = on`)

| Vue | Contenu |
| --- | --- |
| `profile_stats` | Par profil (`profile_id`) : `seeds_count`, `blooms_count`, `pollinations_given`, `intentions_count`, `blooms_inspired` (floraisons d'autres membres issues de ses graines), `followers_count`, `following_count`. Sert au statut (voir `levelFor`/`pollenPoints` dans `lib/earth.ts`). Pas de relation PostgREST vers `profiles` : faire une 2ᵉ requête `profiles.in("id", ids)`. |
| `ecosystem_stats` | Par localité (`initcap(trim(location))`) : graines, floraisons, pollinisations, vues, membres |
| `category_stats` | Par catégorie : graines, floraisons, pollinisations |
| `global_stats` | Une ligne : totaux de la plateforme |
| `growth_funnel` | Une ligne (espace administrateurs) : entonnoir d'activation en comptes distincts (`members`, `with_username`, `with_profile`, `with_location`, `following_someone`, `pollinated`, `intended`, `planted`, `bloomed`), activité (`new_7d`, `new_30d`, `active_7d`, `active_30d`, `returning_30d` = inscrits depuis plus de 30 jours et actifs ce mois-ci), impact (`seeds`, `seeds_with_location`, `seeds_with_image`, `blooms`, `pollinations`, `intentions`, `germinating`, `ecosystems`) et `open_reports` (non nul uniquement pour un administrateur, via la RLS de `reports`). Un membre est « actif » s'il a publié, commenté, pollinisé ou s'est lancé. Agrégats anonymes calculés sur des tables publiques en lecture. |
| `growth_weekly` | 16 lignes (semaines ISO, la plus ancienne en premier) : `week_start`, `new_members`, `active_members`, `seeds`, `blooms`, `pollinations`, `intentions`. |

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
// author:profiles!posts_author_id_fkey(...), stats:post_stats(...), parent:parent_id(...)
// ⚠️ Auto-jointure : `parent:parent_id(...)` donne la graine parente (objet ou null) ;
// `parent:posts!parent_id(...)` donnerait la liste des floraisons enfants.
// ⚠️ Depuis `posts`, toujours préciser `!posts_author_id_fkey` : sans ce suffixe, PostgREST
// renvoie « more than one relationship was found for 'posts' and 'profiles' » (liens
// indirects via pollinations, intentions, post_views, comments).
```

Les types stricts (`Database`, `Tables<'posts'>`, etc.) sont disponibles depuis
`lib/supabase/database.types.ts` pour toute requête typée.

## Ce qui n'existe pas (volontairement, à ce stade)

- Pas de notifications ni de messagerie privée.
- Pas d'écran de modération dans l'appli (les signalements existent et sont lisibles par les
  administrateurs, mais se traitent dans la console) ; pas de compte « commune » ni de rôle
  modérateur distinct du rôle administrateur.
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
