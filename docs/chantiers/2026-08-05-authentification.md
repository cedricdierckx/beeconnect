# Chantier : inscription, connexion, déconnexion

**Statut : En cours** (agent : refonte EarthConnect — MVP complet, depuis : 2026-10-12)
**Créé le : 2026-08-05**

## Périmètre

- `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`
- Logique d'accès à la session : `lib/supabase/auth.ts` (nouveau fichier — helpers
  `signUp`, `signIn`, `signOut`, `getSession` autour du client `lib/supabase/client.ts`)

Si un point d'ancrage dans `app/layout.tsx` est nécessaire pour exposer l'état de session
à la navigation (chantier « navigation-layout »), garder la modification minimale
(quelques lignes) et le signaler dans ce fichier.

## Contexte

`profiles` est déjà créée automatiquement à l'inscription via un déclencheur Supabase
(voir `docs/DATABASE.md`, section « Fonctions et déclencheurs ») : ce chantier n'a pas à
insérer manuellement dans `profiles`, seulement à appeler `supabase.auth.signUp()`.

## Actions attendues

1. Page d'inscription (`email`, `mot de passe`, `username` optionnel transmis en
   `options.data` à `signUp` pour être repris par le déclencheur).
2. Page de connexion.
3. Action de déconnexion (bouton, quel que soit son emplacement final dans la navigation).
4. Gestion des erreurs Supabase Auth affichée à l'utilisateur (email déjà utilisé,
   identifiants invalides, etc.).

## Résultat attendu

Un utilisateur peut s'inscrire, se connecter et se déconnecter ; une ligne apparaît dans
`profiles` après inscription. `npx tsc --noEmit` passe.
