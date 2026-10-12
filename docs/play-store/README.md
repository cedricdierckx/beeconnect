# Publier EarthConnect sur Google Play

EarthConnect est publiée comme **Trusted Web Activity** (TWA) : une appli Android légère qui
affiche le site en plein écran. Toute évolution du site est donc visible immédiatement dans
l'appli, sans nouvelle version sur le Store (sauf changement de domaine, d'icône ou de nom).

## 1. État des lieux

### ✅ Prêt dans l'application

| Exigence | Où |
| --- | --- |
| Politique de confidentialité publique (RGPD, Play) | `/legal/confidentialite` |
| Conditions d'utilisation (règles de contenu, modération DSA) | `/legal/conditions` |
| Mentions légales (Code de droit économique, art. XII.6) | `/legal/mentions-legales` |
| Suppression de compte dans l'appli **et** URL web | Paramètres → Supprimer mon compte ; `/legal/suppression-compte` |
| Export des données (droit d'accès / portabilité) | Paramètres → Télécharger mes données |
| Signaler un contenu ou un profil (Play UGC, DSA art. 16) | Bouton 🚩 (graines, commentaires, profils) → table `reports` |
| Bloquer un membre (Play UGC) | Profil → Bloquer ; liste dans Paramètres |
| Âge minimum (13 ans) et acceptation des conditions à l'inscription | `/signup` (version + date stockées dans le compte) |
| Photos sans métadonnées GPS | Réencodage systématique (`lib/upload.ts`) |
| PWA installable : manifeste, icônes, page hors-ligne, service worker | `app/manifest.ts`, `public/icons/`, `public/sw.js`, `/offline` |
| Lien appli ↔ site (Digital Asset Links) | `/.well-known/assetlinks.json` (variables Vercel, voir §3) |
| Configuration Android (Bubblewrap) | `android/twa-manifest.json` |
| Textes de la fiche, icône, bannière, captures provisoires | `fiche-store.md`, `assets/` |
| Réponses « Sécurité des données » | `securite-des-donnees.md` |

### ⏳ À fournir ou décider par l'éditeur

1. **Identité de l'éditeur** : remplacer les « [À COMPLÉTER …] » dans `lib/legal.ts` (nom,
   forme juridique, adresse, BCE, TVA, e-mail de contact). Tant qu'ils manquent, un bandeau
   s'affiche sur les pages légales — **Google refusera une politique de confidentialité
   incomplète**.
2. **Fonction SQL de suppression de compte** : coller
   `supabase/migrations/20261012120100_earthconnect_delete_my_account.sql` dans Supabase →
   SQL Editor → Run (non applicable via le connecteur, voir `docs/DATABASE.md`).
3. **Nom de domaine** (fortement recommandé avant la 1ʳᵉ publication) : l'adresse du site est
   inscrite dans l'appli et affichée sur la fiche. Avec un domaine propre (ex.
   `earthconnect.be`), mettre à jour `lib/legal.ts` (`siteUrl`), `android/twa-manifest.json`,
   la Site URL Supabase et les liens de cette documentation.
4. **Identifiant du paquet** : `be.earthconnect.app` proposé (`lib/app-config.ts`,
   `android/twa-manifest.json`) — **définitif** une fois l'appli créée sur Play.
5. **Compte développeur Google Play** (25 $ une fois, vérification d'identité). Compte
   *organisation* : numéro D-U-N-S requis. Compte *personnel* récent : **test fermé
   obligatoire avec au moins 12 testeurs pendant 14 jours** avant la mise en production.
6. **Modération** : désigner qui traite les signalements (table `reports`, console Supabase)
   et répond à l'adresse de contact — engagement pris dans les conditions d'utilisation.
7. **Contenus de départ et compte de test** : publier quelques vraies graines avant la
   soumission (une appli vide risque un refus « fonctionnalités minimales ») et créer un
   compte de démonstration pour les examinateurs de Google.
8. **Relecture juridique** des pages légales par un juriste (recommandé).

## 2. Fabriquer l'appli Android (PWABuilder, sans installer d'outils)

1. Aller sur **https://www.pwabuilder.com**, coller l'adresse du site, cliquer **Start**.
2. Cliquer **Package For Stores** → **Android** → **Generate Package**, puis **Options** :
   - *Package ID* : `be.earthconnect.app` (ou l'identifiant retenu)
   - *App name* / *Launcher name* : `EarthConnect`
   - *App version* : `1.0.0` — *Version code* : `1`
   - *Start URL* : `/feed` — *Display* : `standalone`
   - *Signing key* : **Create new**, renseigner un mot de passe solide et le nom de l'éditeur.
3. Télécharger le **.zip**. Il contient l'appli (`.aab`), une version de test (`.apk`), la
   **clé de signature** (`signing.keystore`) et ses mots de passe (`signing-key-info.txt`).
   👉 **Sauvegarder la clé et les mots de passe en lieu sûr** : sans elle, impossible de
   publier une mise à jour. Ne jamais la mettre dans le dépôt.

Alternative en ligne de commande : `npx @bubblewrap/cli build` dans le dossier `android/`
(voir `android/README.md`).

## 3. Relier l'appli au site (plein écran, sans barre d'adresse)

1. Play Console → l'appli → **Tester et publier → Configuration → Intégrité de l'appli →
   Signature de l'appli** : copier l'empreinte **SHA-256** du *certificat de la clé de
   signature d'application* (et celle de la *clé d'importation*).
2. Dans Vercel, projet `beeconnect` → **Settings → Environment Variables** (Production) :
   - `ANDROID_SHA256_CERT_FINGERPRINTS` = les deux empreintes, séparées par une virgule ;
   - `ANDROID_PACKAGE_NAME` = l'identifiant du paquet (si différent de `be.earthconnect.app`).
3. Vérifier que `https://<domaine>/.well-known/assetlinks.json` affiche bien les empreintes.

## 4. Remplir la Play Console

| Rubrique | Réponse |
| --- | --- |
| Règles de confidentialité | `https://<domaine>/legal/confidentialite` |
| Accès à l'appli | Certaines fonctionnalités nécessitent une connexion → fournir l'e-mail et le mot de passe du compte de démonstration |
| Annonces | L'appli **ne contient pas** de publicité |
| Classification du contenu (IARC) | Catégorie « Réseaux sociaux » ; violence, sexualité, langage, drogues, jeux d'argent : **non** ; les utilisateurs peuvent interagir et partager du contenu : **oui** ; partage de la position de l'appareil : **non** ; achats numériques : **non** |
| Public cible | 13-15 ans, 16-17 ans, 18 ans et plus (**pas** de moins de 13 ans) ; l'appli n'est pas conçue pour les enfants |
| Applis d'actualité / santé / finances / gouvernementales | Non |
| Sécurité des données | voir `securite-des-donnees.md` |
| Suppression de compte | `https://<domaine>/legal/suppression-compte` |
| Fiche du Store | voir `fiche-store.md` et `assets/` |

## 5. Publication

1. **Test interne** : importer le `.aab`, s'installer l'appli, vérifier connexion,
   publication d'une graine avec photo, signalement, suppression d'un compte de test.
2. **Test fermé** (obligatoire pour un compte personnel récent) : ≥ 12 testeurs inscrits
   pendant 14 jours consécutifs.
3. **Production** : demander l'accès, soumettre ; l'examen Google prend en général de
   quelques jours à une semaine.
