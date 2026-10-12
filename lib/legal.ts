// Informations légales d'EarthConnect — source unique utilisée par les pages /legal/*.
// ⚠️ Les valeurs « [À COMPLÉTER …] » doivent être remplacées par l'éditeur avant toute
// publication (Code de droit économique, art. XII.6 ; RGPD, art. 13).

const TODO = "[À COMPLÉTER";

export const LEGAL = {
  appName: "EarthConnect",
  siteUrl: "https://beeconnect-eight.vercel.app",
  /** Date de la dernière mise à jour des documents légaux. */
  lastUpdated: "12 octobre 2026",
  /** Version des conditions acceptées à l'inscription (enregistrée dans les métadonnées du compte). */
  termsVersion: "2026-10-12",
  minAge: 13,

  publisher: {
    /** Personne physique ou dénomination sociale de l'éditeur. */
    name: `${TODO} : nom de la personne ou de l'organisation éditrice]`,
    /** Forme juridique (ex. « ASBL », « SRL », « personne physique »). */
    legalForm: `${TODO} : forme juridique]`,
    /** Adresse géographique complète (siège ou domicile professionnel). */
    address: `${TODO} : adresse postale complète]`,
    /** Numéro d'entreprise (BCE) — si applicable. */
    companyNumber: `${TODO} : numéro d'entreprise BCE ou « non applicable »]`,
    /** Numéro de TVA — si assujetti. */
    vatNumber: `${TODO} : numéro de TVA ou « non assujetti »]`,
    /** Adresse e-mail de contact (aussi point de contact DSA et vie privée). */
    email: `${TODO} : adresse e-mail de contact]`,
  },

  /** Sous-traitants techniques (RGPD art. 28) et hébergeurs (Code de droit économique, art. XII.6). */
  processors: [
    {
      name: "Supabase Inc.",
      website: "https://supabase.com",
      role: "Base de données, authentification, stockage des photos et envoi des e-mails du service",
      location: "Données hébergées dans l'Union européenne (Paris, France)",
    },
    {
      name: "Vercel Inc.",
      website: "https://vercel.com",
      role: "Hébergement et diffusion de l'application web",
      location: "Réseau mondial ; traitement possible d'adresses IP aux États-Unis",
    },
  ],

  authority: {
    name: "Autorité de protection des données (APD)",
    address: "Rue de la Presse 35, 1000 Bruxelles",
    website: "https://www.autoriteprotectiondonnees.be",
  },
} as const;

export function isPlaceholder(value: string): boolean {
  return value.startsWith(TODO);
}

export function hasPlaceholders(): boolean {
  return Object.values(LEGAL.publisher).some(isPlaceholder);
}

/** Adresse de contact affichable dans un lien `mailto:` (null tant qu'elle n'est pas renseignée). */
export function contactEmail(): string | null {
  return isPlaceholder(LEGAL.publisher.email) ? null : LEGAL.publisher.email;
}

export const LEGAL_PAGES = [
  { href: "/legal/conditions", label: "Conditions d'utilisation", emoji: "📜" },
  { href: "/legal/confidentialite", label: "Confidentialité", emoji: "🔒" },
  { href: "/legal/mentions-legales", label: "Mentions légales", emoji: "🏛️" },
  { href: "/legal/suppression-compte", label: "Supprimer mon compte", emoji: "🗑️" },
] as const;
