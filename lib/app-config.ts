// Identité de l'application installable (PWA) et du paquet Android (Trusted Web Activity).

export const APP = {
  name: "EarthConnect",
  shortName: "EarthConnect",
  description: "Le réseau social où les bonnes actions se pollinisent.",
  themeColor: "#2F9E5B",
  backgroundColor: "#FFF9EC",
  /**
   * Identifiant du paquet Android. ⚠️ Définitif dès la première publication sur Google
   * Play : à valider avant la création de l'appli. Surchargeable par ANDROID_PACKAGE_NAME.
   */
  androidPackage: process.env.ANDROID_PACKAGE_NAME || "be.earthconnect.app",
} as const;
