# Chantier : préparation à la publication sur le Google Play Store

**Statut : Bloqué** (raison : informations et actions réservées à l'éditeur — identité légale dans `lib/legal.ts`, fonction SQL `delete_my_account` à coller dans la console Supabase, compte développeur Google Play, choix du domaine et de l'identifiant de paquet ; détail dans `docs/play-store/README.md` §1)
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

## Avancement (2026-10-12)

Fait : pages légales, signalement, blocage, export et suppression de compte, consentement à
l'inscription, suppression des métadonnées photo, PWA (manifeste, icônes, service worker,
hors-ligne), Digital Asset Links, configuration Bubblewrap, dossier `docs/play-store/`
(guide, fiche, sécurité des données, visuels). Tables `reports` et `blocks` appliquées.

Reste (éditeur) : voir `docs/play-store/README.md`, section « À fournir ou décider ».
Une fois l'empreinte SHA-256 connue, un agent disposant du MCP Vercel peut créer la variable
`ANDROID_SHA256_CERT_FINGERPRINTS` (outil `create_project_env`).
