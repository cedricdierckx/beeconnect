# Chantier : fil de publications et création de post

**Statut : Clôturé**
**Clôturé le : 2026-10-12**
**Créé le : 2026-08-05**

## Périmètre

- `app/feed/page.tsx` (remplace à terme le contenu de démonstration de `app/page.tsx`,
  qui peut rediriger ou pointer vers `/feed`)
- Composants : `app/components/PostCard.tsx`, `app/components/PostForm.tsx`

## Contexte

Table `posts` déjà en place (`docs/DATABASE.md`) : lecture publique, écriture réservée à
l'auteur (`author_id = auth.uid()`). Ce chantier suppose qu'un utilisateur peut être
authentifié (chantier « authentification ») mais peut être développé en parallèle en
utilisant `supabase.auth.getUser()` directement, sans attendre que les pages de connexion
existent.

## Actions attendues

1. Liste des publications les plus récentes (`order by created_at desc`), avec auteur
   (jointure `profiles`).
2. Formulaire de création de publication (texte obligatoire, image optionnelle via le
   bucket `post-images` — voir `docs/DATABASE.md` pour la convention de chemin
   `{user_id}/nom-de-fichier`).
3. Pagination ou chargement incrémental simple (curseur sur `created_at`, pas besoin d'une
   solution sophistiquée pour ce chantier).

## Résultat attendu

Un utilisateur authentifié peut publier un message et le voir apparaître dans le fil.
`npx tsc --noEmit` passe.

## Résolution

Réalisé dans le cadre du chantier `2026-10-12-refonte-earthconnect.md` (renommage en
EarthConnect, « J'aime » remplacé par « Polliniser »). Voir ce fichier pour le détail.
