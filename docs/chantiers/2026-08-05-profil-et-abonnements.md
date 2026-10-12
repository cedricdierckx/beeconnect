# Chantier : page profil et abonnements

**Statut : Clôturé**
**Clôturé le : 2026-10-12**
**Créé le : 2026-08-05**

## Périmètre

- `app/profile/[username]/page.tsx` (profil public : bio, publications de l'utilisateur,
  bouton s'abonner/se désabonner, compteurs abonnés/abonnements)
- `app/profile/edit/page.tsx` (édition de son propre profil : `username`, `full_name`,
  `bio`, `location`, upload d'avatar)
- Composant : `app/components/FollowButton.tsx`

## Contexte

Tables `profiles` et `follows` déjà en place (`docs/DATABASE.md`). `follows` interdit de
se suivre soi-même (contrainte `follows_no_self_follow`) : le bouton « s'abonner » doit
être absent ou désactivé sur son propre profil. L'upload d'avatar suit la convention de
chemin `{user_id}/nom-de-fichier` dans le bucket `avatars` (public en lecture).

## Actions attendues

1. Page profil public accessible par `username`.
2. Page d'édition de son propre profil (accès restreint à l'utilisateur authentifié
   concerné, cohérent avec la politique RLS `UPDATE` de `profiles`).
3. `FollowButton` avec bascule s'abonner/se désabonner et mise à jour du compteur.

## Résultat attendu

Un utilisateur peut consulter un profil, s'abonner/se désabonner, et modifier son propre
profil (y compris avatar). `npx tsc --noEmit` passe.

## Résolution

Réalisé dans le cadre du chantier `2026-10-12-refonte-earthconnect.md` (renommage en
EarthConnect, « J'aime » remplacé par « Polliniser »). Voir ce fichier pour le détail.
