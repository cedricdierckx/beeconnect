# Formulaire « Sécurité des données » (Data safety) — réponses

Play Console → **Règles et programmes → Contenu de l'appli → Sécurité des données**.
Réponses établies d'après le code et la [politique de confidentialité](../../app/legal/confidentialite/page.tsx).
À revoir si une fonctionnalité nouvelle collecte d'autres données (ex. notifications,
statistiques d'audience, géolocalisation).

## Vue d'ensemble

| Question | Réponse |
| --- | --- |
| L'appli collecte-t-elle ou partage-t-elle des types de données utilisateur requis ? | **Oui** |
| Toutes les données collectées sont-elles chiffrées en transit ? | **Oui** (HTTPS uniquement) |
| Proposez-vous un moyen de demander la suppression des données ? | **Oui** — dans l'appli (Paramètres → Supprimer mon compte) et via l'URL `https://beeconnect-eight.vercel.app/legal/suppression-compte` |
| L'appli permet-elle de créer un compte ? | **Oui**, avec nom d'utilisateur et mot de passe |
| URL de suppression de compte | `https://beeconnect-eight.vercel.app/legal/suppression-compte` |

« Partage » au sens de Google = transmission à un tiers **autre** qu'un prestataire agissant
pour notre compte. Supabase et Vercel sont des sous-traitants : **aucune donnée n'est
« partagée »**.

## Types de données collectées

| Catégorie Google | Type | Collecté | Partagé | Traitement éphémère | Obligatoire ? | Finalités |
| --- | --- | --- | --- | --- | --- | --- |
| Informations personnelles | Nom (nom affiché) | Oui | Non | Non | Facultatif | Fonctionnement de l'appli, gestion du compte |
| Informations personnelles | Adresse e-mail | Oui | Non | Non | Obligatoire | Gestion du compte, communications (e-mails du service) |
| Informations personnelles | Identifiants utilisateur (pseudo, identifiant de compte) | Oui | Non | Non | Obligatoire | Fonctionnement de l'appli, gestion du compte |
| Informations personnelles | Autres infos (bio, commune ou quartier saisis) | Oui | Non | Non | Facultatif | Fonctionnement de l'appli |
| Photos et vidéos | Photos | Oui | Non | Non | Facultatif | Fonctionnement de l'appli |
| Activité dans l'appli | Interactions dans l'appli (pollinisations, « Je me lance », abonnements, publications vues, blocages) | Oui | Non | Non | Obligatoire* | Fonctionnement de l'appli, statistiques (agrégées), sécurité |
| Activité dans l'appli | Autres contenus générés par l'utilisateur (graines, commentaires, signalements) | Oui | Non | Non | Facultatif | Fonctionnement de l'appli, sécurité / prévention des abus, conformité |

\* Les vues sont enregistrées automatiquement pour un membre connecté.

**Non collectés** : position (approximative ou précise) de l'appareil, contacts, messages
privés, données financières, santé, fichiers audio/vidéo, agenda, historique web,
identifiants d'appareil ou publicitaires, journaux de plantage, diagnostics.

Remarque (certitude ≈ 70 %) : la commune saisie librement n'est pas une localisation de
l'appareil ; nous la déclarons sous « Autres infos ». Si Google la requalifie en
« Position approximative », mettre à jour la réponse sans autre changement.

## Pratiques de sécurité

- Chiffrement en transit : oui.
- Suppression des données sur demande : oui (immédiate dans l'appli).
- Examen de sécurité indépendant (MASA) : non.
- Conformité au règlement Familles : sans objet (public cible ≥ 13 ans, voir README).
