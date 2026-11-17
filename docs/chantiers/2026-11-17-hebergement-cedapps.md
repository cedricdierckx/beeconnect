# Chantier : héberger EarthConnect dans le projet Supabase CedApps, puis transférer FamiTeam

**Statut : En cours** (agent : migration Supabase demandée par le propriétaire, depuis : 2026-11-17)
**Créé le : 2026-11-17**

## Périmètre

- Ce dépôt : `lib/supabase/client.ts` (fait), `docs/DATABASE.md`, `README.md`, ce fichier.
- Dépôt CedApps : `docs/DATABASE.md`, `docs/APPS.md`, `docs/chantiers/2026-11-17-schema-beeconnect.md`,
  éventuellement `app/api/keepalive/` + `vercel.json` (réveil quotidien).
- Dépôt FamiTeam : documentation (mention de l'organisation Supabase gratuite).
- Supabase : `BeeConnect Project` (`jcmcpkssjobqkmdopnhj`, Ced Free Org), `CedApps Project`
  (`gqmatjwegdepebriidif`, Ced Free Org), `FamiTeam Project` (`ztraacsqtwslvcjfpdtp`, Ced Pro Org).
- Vercel (équipe `team_6VGvDqwtDoFbxiAx0Yi0LvBR`) : projet `beeconnect` (variables d'environnement).

## Contexte

Demande du propriétaire (2026-11-17) : ne garder qu'**un seul** projet sur l'offre Pro
(« Ced Pro Org ») : NotaTeam. Pour cela :

1. intégrer, **de façon réversible**, `BeeConnect Project` dans `CedApps Project` (les deux
   dans « Ced Free Org ») ;
2. puis déplacer `FamiTeam Project` de « Ced Pro Org » vers « Ced Free Org » ;
3. **sans interruption de service** pour aucune application.

L'offre gratuite limite à **2 projets actifs** : après l'étape 1, « Ced Free Org » doit
compter CedApps (avec EarthConnect dedans) + FamiTeam ; BeeConnect est **mis en pause**
(restaurable 90 jours), jamais supprimé.

Le propriétaire a validé le 2026-11-17 : tout le plan, la copie des données personnelles
des membres EarthConnect entre les deux projets (même prestataire, même région eu-west-3),
le travail sur `main`, et un transfert de FamiTeam « maintenant ».

### Constats déjà faits (2026-11-17)

- Le connecteur Supabase de la première session ne voyait que « Ced Pro Org ». Accès à
  « Ced Free Org » : jeton personnel Supabase dans la variable d'environnement
  `SUPABASE_ACCESS_TOKEN` (API de gestion `https://api.supabase.com/v1/...`, en HTTPS).
  Le port Postgres 5432 est **fermé** depuis le conteneur : pas de `pg_dump`/`psql` ;
  tout passe par `POST /v1/projects/{ref}/database/query` (corps `{"query": "..."}`).
- EarthConnect utilise : 13 tables `public`, 6 vues (`security_invoker`), des fonctions
  (`is_admin`, `delete_my_account`, déclencheurs de compteurs et de floraison), le
  déclencheur `on_auth_user_created` sur `auth.users`, 2 buckets (`avatars`,
  `post-images`), l'authentification e-mail + mot de passe (pas d'OAuth), 6 modèles
  d'e-mails construits sur `{{ .SiteURL }}` (Site URL = `https://beeconnect-eight.vercel.app`),
  pas de Realtime, pas d'Edge Function, aucune clé `service_role` dans l'appli.
- CedApps n'utilise ni Supabase Auth ni Storage (vérifié dans le code) : `auth.users` et
  les buckets du projet CedApps devraient être vides (**à vérifier** avant la copie).
- FamiTeam : 16 Mo de base, 17 comptes, 0 fichier, 3 Edge Functions (`send-mail`,
  `delete-account`, `stripe-webhook`), 1 table en Realtime, activité réelle (2 familles
  actives sur 7 jours). Le transfert ne change ni l'URL ni les clés : aucune modification
  de l'appli FamiTeam n'est nécessaire.
- Le transfert entre organisations se fait dans la console (Project Settings → General →
  Transfer project) ; d'après la doc Supabase, **1 à 2 minutes** d'interruption possibles
  (Pro → Free). Prérequis : pas d'intégration GitHub, pas de log drain, pas d'option
  payante (taille de calcul, PITR, IPv4, domaine personnalisé).
- `compromissimmo` (Vercel) utilise la base de NotaTeam (d'après le commentaire de sa
  variable) : non concerné.

## Actions attendues (dans l'ordre)

### A. Préparation sans effet (fait)

- [x] `lib/supabase/client.ts` : schéma réglable par `NEXT_PUBLIC_SUPABASE_SCHEMA`
  (défaut `public`), clé de session figée sur `sb-jcmcpkssjobqkmdopnhj-auth-token`, et
  session émise par un autre projet présentée comme expirée → renouvelée auprès du projet
  courant. Sans changement de variables : comportement identique (testé).

### B. Copie vers CedApps (aucun impact sur les utilisateurs)

1. Inventaire des deux projets (tables, colonnes, contraintes, index, politiques,
   fonctions, déclencheurs, vues, droits, buckets, nombre d'objets, `auth.users`,
   configuration Auth de BeeConnect : `GET /v1/projects/{ref}/config/auth`).
2. Dans CedApps, schéma `beeconnect` : rejouer les migrations de `supabase/migrations/`
   en remplaçant `public` par `beeconnect` (y compris `search_path` des fonctions et
   références dans les politiques), **sans** le déclencheur sur `auth.users` à ce stade.
   Comparer ensuite le catalogue avec le projet d'origine (zéro écart attendu).
   Droits : `usage` sur le schéma et droits sur tables/vues/fonctions pour `anon`,
   `authenticated`, `service_role`, identiques à ceux de `public` dans BeeConnect.
3. Copier `auth.users`, `auth.identities`, `auth.sessions`, `auth.refresh_tokens` (mêmes
   identifiants, mêmes empreintes de mot de passe ; colonnes communes non générées ;
   recaler la séquence de `refresh_tokens`). Méthode : `json_agg` côté source,
   `json_populate_recordset` côté cible, par lots < 2 Mo.
4. Copier les données des tables `beeconnect.*` dans l'ordre des clés étrangères, avec les
   déclencheurs utilisateur désactivés (`alter table … disable trigger user`), puis les
   réactiver. Créer **ensuite** le déclencheur `on_auth_user_created` (nom préfixé
   `beeconnect_`) sur `auth.users`.
5. Buckets `avatars` et `post-images` (mêmes noms, mêmes réglages, mêmes politiques
   `storage.objects`) ; copier chaque objet via l'API Storage avec les clés `service_role`
   (`GET /v1/projects/{ref}/api-keys?reveal=true`, jamais écrites sur disque ni dans git).
   Réécrire les URL (`profiles.avatar_url`, `posts.image_url`) vers
   `gqmatjwegdepebriidif.supabase.co`.
6. Exposer le schéma à l'API : `PATCH /v1/projects/gqmatjwegdepebriidif/postgrest`
   (`db_schema` = valeur actuelle + `,beeconnect`).
7. Configuration Auth de CedApps (`PATCH /v1/projects/gqmatjwegdepebriidif/config/auth`) :
   Site URL `https://beeconnect-eight.vercel.app`, liste des redirections, 6 modèles et
   sujets (voir `supabase/templates/`), SMTP si BeeConnect en a un (le mot de passe SMTP
   n'est pas lisible : le faire ressaisir par le propriétaire), politique de mot de passe,
   confirmation d'e-mail, limites. CedApps n'utilisant pas l'authentification, c'est sans
   effet sur ses autres applications (à documenter dans CedApps).
8. Vérification de parité : nombre de lignes et somme de contrôle par table, nombre
   d'objets par bucket ; `GET /api/health` d'un déploiement de prévisualisation pointé
   sur CedApps.

### C. Bascule (sans coupure)

1. Variables du projet Vercel `beeconnect` (production et preview) :
   `NEXT_PUBLIC_SUPABASE_URL=https://gqmatjwegdepebriidif.supabase.co`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon de CedApps>`,
   `NEXT_PUBLIC_SUPABASE_SCHEMA=beeconnect` ; noter l'identifiant du déploiement de
   production actuel (retour arrière). Redéployer la production (bascule atomique Vercel).
2. Dès que le nouveau déploiement est en ligne : rattrapage des écritures faites dans
   l'ancien projet depuis la copie (lignes créées/modifiées, comptes, sessions, jetons de
   rafraîchissement, objets), puis contrôle `/api/health` et parcours réel (Playwright) :
   fil, profil, connexion, publication avec image.
3. Surveiller ~1 h l'ancien projet (écritures d'onglets restés ouverts), dernier
   rattrapage, puis **pause** : `POST /v1/projects/jcmcpkssjobqkmdopnhj/pause`.

### D. FamiTeam

1. Vérifier les prérequis (options payantes, intégration GitHub, log drains).
2. Le propriétaire télécharge la dernière sauvegarde quotidienne (Database → Backups),
   puis clique sur « Transfer project » vers « Ced Free Org ».
3. Vérifier : statut `ACTIVE_HEALTHY`, API REST, Edge Functions, connexion.
4. Réveil quotidien (l'offre gratuite met en pause après 7 jours sans activité) pour
   CedApps et FamiTeam : cron Vercel dans CedApps (`app/api/keepalive`), requête légère
   sur chaque projet.

### E. Clôture

Mettre à jour `docs/DATABASE.md` (ici et dans CedApps), `docs/APPS.md` de CedApps, la
doc FamiTeam ; rappeler au propriétaire de **révoquer le jeton** `SUPABASE_ACCESS_TOKEN`.

## Retour arrière (réversibilité)

- **Appli** : Vercel → déploiement de production précédent → « Instant Rollback »
  (l'ancien déploiement a les anciennes variables intégrées), puis remettre les anciennes
  variables (`NEXT_PUBLIC_SUPABASE_URL=https://jcmcpkssjobqkmdopnhj.supabase.co`, clé anon
  de BeeConnect, `NEXT_PUBLIC_SUPABASE_SCHEMA` supprimée).
- **Données** : BeeConnect Project est intact (seulement en pause, restaurable 90 jours :
  `POST /v1/projects/jcmcpkssjobqkmdopnhj/restore`). Les écritures faites dans
  `beeconnect.*` depuis la bascule se recopient en sens inverse avec la même méthode
  (B.3–B.5 inversés).
- **FamiTeam** : retransfert possible vers « Ced Pro Org » de la même façon.

## Résultat attendu

« Ced Pro Org » ne contient plus que NotaTeam ; « Ced Free Org » contient CedApps (avec
EarthConnect dans le schéma `beeconnect`) et FamiTeam ; BeeConnect Project est en pause ;
EarthConnect, les applications CedApps, FamiTeam et NotaTeam fonctionnent.
