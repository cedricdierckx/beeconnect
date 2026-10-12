# Appli Android (Trusted Web Activity)

L'appli Google Play d'EarthConnect est une **Trusted Web Activity** : une coquille Android
qui affiche le site en plein écran (sans barre d'adresse), grâce au lien de confiance
`/.well-known/assetlinks.json` servi par l'application web.

- `twa-manifest.json` : configuration pour [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
  (`npx @bubblewrap/cli build`). Alternative sans ligne de commande : [PWABuilder](https://www.pwabuilder.com)
  — voir `docs/play-store/README.md`.
- **Ne jamais committer** la clé de signature (`*.keystore`, `*.jks`) ni ses mots de passe :
  à conserver hors du dépôt, en lieu sûr (gestionnaire de mots de passe + sauvegarde).
- Si le domaine change (ex. achat d'un domaine `earthconnect.…`), mettre à jour `host`
  et les URL ci-dessus, puis publier une nouvelle version de l'appli.
