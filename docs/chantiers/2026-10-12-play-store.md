# Chantier : préparation à la publication sur le Google Play Store

**Statut : En cours** (agent : préparation Play Store, depuis : 2026-10-12)
**Créé le : 2026-10-12**

## Périmètre

- Pages légales : `app/legal/**`, configuration `lib/legal.ts`
- Modération et RGPD : migration `supabase/migrations/*_moderation_rgpd.sql`
  (signalements, blocages, suppression de compte), `app/settings/`, composants
  `ReportButton`, `BlockButton`, intégrations légères dans `PostCard`, `CommentList`,
  pages profil / graine / inscription, `AuthProvider`
- PWA / TWA : `app/manifest.ts`, `public/icons/`, `public/sw.js`, `app/offline/`,
  route `assetlinks`, `next.config.mjs`, `android/`
- Dossier de soumission : `docs/play-store/`

## Contexte

Publication en tant que Trusted Web Activity (PWA emballée). Exigences Google Play pour
une appli à contenu généré par les utilisateurs : politique de confidentialité publique,
suppression de compte (dans l'appli + URL web), signalement et blocage, CGU interdisant
les contenus répréhensibles, formulaire « Sécurité des données ». Droit applicable :
RGPD, loi belge du 30 juillet 2018, Code de droit économique (livre XII), DSA.

## Résultat attendu

Tout ce qui ne dépend pas de l'utilisateur est prêt ; la liste de ce qui reste à fournir
(identité de l'éditeur, compte développeur, clé de signature, domaine) est documentée.
