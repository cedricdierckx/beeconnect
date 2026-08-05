# Chantiers — travailler à plusieurs sur `main`

Ce dépôt est conçu pour que **plusieurs agents codent en parallèle**, directement sur la
branche `main` (voir `CLAUDE.md` : aucune branche de fonctionnalité n'est créée). Le
système de « chantiers » découpe le travail en tâches autonomes afin que les agents ne se
marchent pas dessus, et permette de transmettre une tâche qu'un agent ne peut pas terminer
lui-même (accès outillage manquant, décision à prendre par l'utilisateur, etc.).

## Où trouver les chantiers

Chaque chantier est un fichier `docs/chantiers/AAAA-MM-JJ-titre-court.md`. Il n'y a pas
d'index séparé à maintenir : pour connaître l'état des lieux, parcourir le dossier
(`ls docs/chantiers/`) et lire le statut en tête de chaque fichier. Les fichiers clôturés
restent dans l'historique à titre de traçabilité ; ils ne sont jamais supprimés.

## Statuts

- **Ouvert** — disponible, personne n'y travaille.
- **En cours** (agent : `<description succincte>`, depuis : `AAAA-MM-JJ`) — quelqu'un s'en
  occupe activement.
- **Bloqué** (raison : `...`) — nécessite un accès, un outillage ou une décision que
  l'agent courant n'a pas. La raison doit être assez précise pour qu'un autre agent (ou
  l'utilisateur) sache exactement quoi apporter pour débloquer.
- **Clôturé** — terminé, avec un résumé du résultat obtenu et, le cas échéant, la mise à
  jour de la documentation annexe (`docs/DATABASE.md`, `README.md`, etc.).

## Réserver un chantier

1. `git pull --rebase origin main` pour repartir de l'état le plus récent.
2. Vérifier que le chantier visé est bien encore **Ouvert**.
3. Passer son statut à **En cours**, pousser ce seul changement immédiatement (petit
   commit dédié) avant de commencer le travail de fond — cela réserve la tâche et évite
   qu'un autre agent la prenne en même temps.
4. Travailler dans le périmètre de fichiers annoncé par le chantier. Si le travail déborde
   de ce périmètre, l'indiquer dans le fichier pour prévenir les autres agents.

## Créer un nouveau chantier

Utiliser le gabarit suivant :

```markdown
# Chantier : <titre court>

**Statut : Ouvert**
**Créé le : AAAA-MM-JJ**

## Périmètre
<fichiers/dossiers concernés — le plus précis possible pour ne pas chevaucher un autre chantier>

## Contexte
<pourquoi, dépendances avec d'autres chantiers ou tables Supabase concernées>

## Actions attendues
<liste concrète>

## Résultat attendu
<critère de "fait">
```

À la clôture, ajouter une section **Résolution** décrivant ce qui a été fait, et, si le
chantier était **Bloqué**, ce qui manquait exactement.

## Règles pour limiter les conflits entre agents en parallèle sur `main`

1. `git pull --rebase origin main` avant de commencer **et** juste avant de pousser.
2. Aucune branche de fonctionnalité : tout le monde commite directement sur `main`.
3. Choisir un chantier dont le périmètre de fichiers ne chevauche pas un chantier **En
   cours** par un autre agent.
4. Committer par petites étapes cohérentes plutôt qu'un unique gros commit final — un
   conflit de rebase sur un petit commit se résout en quelques secondes, sur un gros
   commit il peut devenir illisible.
5. Avant de pousser : `npx tsc --noEmit` (et `npm run lint` si pertinent) pour ne jamais
   laisser `main` cassé pour les autres agents.
6. Si le push est rejeté (non-fast-forward), refaire `git pull --rebase origin main`,
   résoudre les conflits, puis pousser à nouveau. Ne jamais `--force`.
7. Ne jamais committer de secret (clé API, jeton, mot de passe) — utiliser `.env.local`
   (non suivi par git, voir `.env.example`).
8. Lire `docs/DATABASE.md` avant toute fonctionnalité touchant aux données : le schéma
   Supabase réel y est documenté, inutile (et souvent impossible) d'y accéder directement.

## Chantiers nécessitant un accès outillage spécifique

Si un chantier nécessite un accès MCP dont l'agent courant ne dispose pas (Supabase,
Vercel, GitHub, etc.), le laisser avec le statut **Bloqué** et une description précise de
l'accès manquant et de ce qui reste à faire, afin qu'un agent disposant de cet outillage
puisse le reprendre sans repartir de zéro.
