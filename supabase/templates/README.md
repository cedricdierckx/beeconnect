# Modèles d'e-mails EarthConnect (Supabase Auth)

Fichiers **générés** par `node scripts/build-email-templates.mjs` : modifier le script,
puis relancer la génération — ne pas éditer les `.html` à la main.

## Installation (console Supabase, non faisable via le MCP)

> ✅ **Installés** dans le projet *BeeConnect Project* le 2026-10-12 (par l'utilisateur).
> Après toute modification du script, regénérer **et** recoller les modèles concernés.

Projet *BeeConnect Project* → **Authentication → Emails → Templates**. Pour chaque
modèle : coller le **sujet**, puis le contenu du fichier `.html` dans « Message body »
(onglet *Source*), et enregistrer.

| Modèle Supabase | Fichier | Sujet |
| --- | --- | --- |
| Confirm sign up | `confirmation.html` | 🌱 Confirme ton adresse et rejoins le jardin EarthConnect |
| Reset password | `recovery.html` | 🔑 Choisis un nouveau mot de passe EarthConnect |
| Magic link | `magic_link.html` | ✨ Ton lien de connexion EarthConnect |
| Change email address | `email_change.html` | 📬 Confirme ta nouvelle adresse e-mail EarthConnect |
| Invite user | `invite.html` | 🐝 Tu es invité·e à rejoindre EarthConnect |
| Reauthentication | `reauthentication.html` | 🔐 Ton code de vérification EarthConnect |

**Prérequis** : Authentication → URL Configuration → *Site URL* =
`https://beeconnect-eight.vercel.app` (les liens sont construits avec `{{ .SiteURL }}`).

## Fonctionnement des liens

Les liens ne pointent pas vers `{{ .ConfirmationURL }}` mais vers
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=…&next=…`.
La page `app/auth/confirm/page.tsx` n'appelle `supabase.auth.verifyOtp` **qu'au clic**
sur son bouton : les antivirus de messagerie qui pré-ouvrent les liens ne consomment
plus le jeton (cause des erreurs `otp_expired`). `type=recovery` et `type=invite`
mènent ensuite à `/reset/update` (choix du mot de passe).

Personnalisation : `{{ .Data.username }}` (métadonnées d'inscription) dans le titre du
mail de confirmation.

## Expéditeur

Avec le SMTP intégré de Supabase, l'expéditeur reste `Supabase Auth
<noreply@mail.app.supabase.io>` et l'envoi est fortement limité (quelques e-mails par
heure). Pour un expéditeur « EarthConnect » et des volumes réels, configurer un SMTP
personnalisé : Authentication → Emails → **SMTP Settings** (ex. Resend, Brevo, Postmark),
avec un domaine vérifié (SPF/DKIM).
