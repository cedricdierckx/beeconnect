# Chantier : espace administrateurs et page « Développement du réseau »

**Statut : Clôturé** (2026-10-20 : migration appliquée sur `BeeConnect Project`, premier administrateur désigné, types régénérés)
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

## Déblocage (2026-10-20)

1. Migration appliquée via le connecteur Supabase (`apply_migration`, nom
   `earthconnect_admin_space`). Contrôles : `growth_weekly` renvoie bien 16 semaines ;
   `get_advisors` (sécurité) ne signale que des avertissements attendus : `is_admin()` et
   `delete_my_account()` exécutables en `security definer` (voulu, voir
   `docs/DATABASE.md`), et la protection contre les mots de passe divulgués désactivée
   (réglage Auth à activer dans la console).
2. Premier administrateur désigné (compte de l'éditeur, note « éditeur »).
3. `lib/supabase/database.types.ts` régénéré (`generate_typescript_types`) : seul
   `PostgrestVersion` différait des types écrits à la main (`14.5` → `14.15`) ;
   `npx tsc --noEmit` passe.
4. Reste à l'éditeur, dans l'espace : cliquer « Charger les objectifs de départ » et
   « Charger le plan de départ », puis adapter.

## Pistes ouvertes

- Écran de traitement des signalements dans `/admin` (les politiques RLS le permettent déjà).
- Objectifs par territoire (commune pilote) et comptes « organisation ».
- Notifications et e-mail hebdomadaire, premières actions du plan de départ.
