# Chantier : espace administrateurs et page « Développement du réseau »

**Statut : Bloqué** (raison : la migration `supabase/migrations/20261019100000_earthconnect_admin_space.sql` doit être appliquée dans Supabase → SQL Editor par un agent disposant du connecteur Supabase du projet `BeeConnect Project`, ou par l'éditeur ; puis désigner le premier administrateur et régénérer les types. Tout le code est en place et vérifié.)
**Créé le : 2026-10-19**

## Périmètre

- `supabase/migrations/20261019100000_earthconnect_admin_space.sql`, `lib/supabase/database.types.ts`
- `lib/growth.ts` (leviers, objectifs, entonnoir, diagnostic, plan de départ)
- `app/admin/**` (coquille, vue d'ensemble, `developpement/`)
- `app/components/AuthProvider.tsx` (`isAdmin`), `app/components/NavBar.tsx` (lien « Admin »)
- `app/api/health/route.ts` (vérifications `growth_funnel`, `growth_weekly`, `admins`)
- `docs/DATABASE.md`, `README.md`, `CLAUDE.md`

## Contexte

Demande du propriétaire : un espace réservé aux administrateurs, avec une page consacrée
au développement du réseau EarthConnect, pour qu'il ait le plus de membres et le plus
d'impact positif possible. Aucun rôle n'existait ; l'application n'utilise que la clé
`anon` et les politiques RLS, donc le rôle doit vivre en base (`admins` + `is_admin()`).

## Actions réalisées

1. **Rôle administrateur** : table `admins` (aucune écriture possible depuis l'appli),
   fonction `is_admin()` (`security definer`), politiques administrateur sur `reports`
   (lecture et mise à jour du statut).
2. **Développement du réseau** : tables `growth_goals` (objectifs chiffrés et datés) et
   `growth_actions` (plan par levier, impact/effort, statut, responsable, échéance),
   réservées aux administrateurs ; vues `growth_funnel` (entonnoir d'activation, activité,
   impact, signalements ouverts) et `growth_weekly` (16 semaines).
3. **Interface** : `/admin` (vue d'ensemble : chiffres clés, santé technique via
   `/api/health`, administrateurs, mode d'emploi pour en désigner) et
   `/admin/developpement` (le cap : objectifs avec progression ; le pouls : 6 indicateurs et
   6 graphiques hebdomadaires ; le parcours des membres avec la plus grosse perte mise en
   évidence ; diagnostic automatique dont chaque constat s'ajoute au plan en un clic ; plan
   d'actions filtrable par levier, priorisé, avec plan de départ de 17 actions).
4. Lien « Admin » dans la barre de navigation (administrateurs seulement), `noindex`.
5. Vérifications : `npx tsc --noEmit`, `npm run lint`, `next build` ; migration rejouée
   sur un PostgreSQL 16 local avec stubs `auth` : vues correctes, RLS vérifiée pour anonyme,
   membre et administrateur.

## Reste à faire (débloquer)

1. Appliquer la migration dans Supabase → SQL Editor (le connecteur de la session
   n'avait pas accès au projet). Vérifier ensuite `GET /api/health` (`growth_funnel`,
   `growth_weekly`, `admins` → `ok`) et `get_advisors` (sécurité).
2. Désigner le premier administrateur (SQL dans `docs/DATABASE.md`, section `admins`).
3. Régénérer `lib/supabase/database.types.ts` (`generate_typescript_types`) et vérifier
   `npx tsc --noEmit` : les types ont été écrits à la main.
4. Dans l'espace, cliquer « Charger les objectifs de départ » et « Charger le plan de
   départ », puis adapter.

## Pistes ouvertes

- Écran de traitement des signalements dans `/admin` (les politiques RLS le permettent déjà).
- Objectifs par territoire (commune pilote) et comptes « organisation ».
- Notifications et e-mail hebdomadaire, premières actions du plan de départ.
