# Chantier : commentaires et mentions « j'aime »

**Statut : En cours** (agent : refonte EarthConnect — MVP complet, depuis : 2026-10-12)
**Créé le : 2026-08-05**

## Périmètre

- Composants : `app/components/CommentList.tsx`, `app/components/CommentForm.tsx`,
  `app/components/LikeButton.tsx`

Ces composants sont conçus pour être intégrés dans `PostCard.tsx` (chantier « fil de
publications ») mais peuvent être développés et testés indépendamment (ils ne prennent que
`postId`/`post` en props) : ne pas modifier `PostCard.tsx` soi-même si ce chantier est
« En cours » ailleurs, décrire l'intégration attendue en props dans ce fichier à la place.

## Contexte

Tables `comments` et `likes` déjà en place (`docs/DATABASE.md`). `likes` a une contrainte
d'unicité (`post_id`, `user_id`) : une tentative de double like doit être gérée sans
crasher l'interface (upsert ou vérification préalable de l'état).

## Actions attendues

1. `LikeButton` : affiche le nombre de mentions « j'aime » et l'état (aimé/non aimé) pour
   l'utilisateur courant, bascule au clic.
2. `CommentList` : liste les commentaires d'une publication avec leur auteur.
3. `CommentForm` : ajoute un commentaire (utilisateur authentifié requis).

## Résultat attendu

Props d'intégration documentées en tête de chaque composant (commentaire JSDoc), pour que
le chantier « fil de publications » puisse les brancher sans ambiguïté. `npx tsc --noEmit`
passe.
