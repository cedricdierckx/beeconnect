# Chantier : mise en page commune et navigation

**Statut : En cours** (agent : refonte EarthConnect — MVP complet, depuis : 2026-10-12)
**Créé le : 2026-08-05**

## Périmètre

- `app/layout.tsx`, `app/globals.css`
- Nouveaux composants partagés : `app/components/NavBar.tsx` (et tout composant de mise
  en page strictement partagé, ex. `app/components/Footer.tsx`)

Ne pas implémenter ici la logique d'authentification elle-même (voir le chantier
« authentification ») : se limiter à l'affichage (liens « Connexion »/« Mon profil »
conditionnés à un état passé en props ou lu via un hook simple, sans construire tout le
flux de connexion).

## Contexte

L'application n'a aujourd'hui qu'une page statique (`app/page.tsx`). Il n'existe aucune
mise en page commune ni navigation entre les futures pages (fil, profil, connexion...).

## Actions attendues

1. Définir une mise en page de base dans `app/layout.tsx` (en-tête avec logo/nom
   BeeConnect, navigation principale, pied de page minimal).
2. Créer `app/components/NavBar.tsx` avec les liens vers les pages prévues par les autres
   chantiers (fil, profil, connexion) — utiliser des liens même si les pages n'existent pas
   encore, elles seront ajoutées par d'autres chantiers.
3. Style minimal et cohérent dans `app/globals.css` (pas de dépendance à une bibliothèque
   de composants externe pour rester léger).

## Résultat attendu

Toute page de l'application partage un en-tête de navigation cohérent. `npx tsc --noEmit`
et `npm run lint` passent.
