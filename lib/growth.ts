// Développement du réseau (espace administrateurs) : leviers de croissance, objectifs,
// diagnostic automatique et plan de départ.

import type { Tables } from "./supabase/database.types";

export type Funnel = Tables<"growth_funnel">;
export type Weekly = Tables<"growth_weekly">;
export type GrowthAction = Tables<"growth_actions">;
export type GrowthGoal = Tables<"growth_goals">;

export type LeverId = "acquisition" | "activation" | "retention" | "referral" | "impact" | "partnership";

export type Lever = {
  id: LeverId;
  label: string;
  emoji: string;
  /** Question à laquelle répond le levier. */
  question: string;
  tone: string;
};

export const LEVERS: Lever[] = [
  { id: "acquisition", label: "Acquisition", emoji: "📣", question: "Comment faire venir de nouveaux membres ?", tone: "bg-sky-100 text-sky-500" },
  { id: "activation", label: "Activation", emoji: "🌱", question: "Comment les faire agir dès leur arrivée ?", tone: "bg-leaf-100 text-leaf-700" },
  { id: "retention", label: "Rétention", emoji: "🔁", question: "Comment les faire revenir ?", tone: "bg-honey-100 text-honey-600" },
  { id: "referral", label: "Parrainage", emoji: "🐝", question: "Comment les amener à inviter d'autres personnes ?", tone: "bg-orange-100 text-orange-700" },
  { id: "impact", label: "Impact réel", emoji: "🌸", question: "Comment transformer plus d'intentions en floraisons ?", tone: "bg-petal-100 text-petal-500" },
  { id: "partnership", label: "Partenariats", emoji: "🤝", question: "Quels relais (écoles, communes, associations) mobiliser ?", tone: "bg-violet-100 text-violet-700" },
];

export function getLever(id: string | null | undefined): Lever {
  return LEVERS.find((l) => l.id === id) ?? LEVERS[0];
}

export type StatusId = "idea" | "planned" | "in_progress" | "done" | "dropped";

export const STATUSES: { id: StatusId; label: string; emoji: string; tone: string }[] = [
  { id: "idea", label: "Idée", emoji: "💡", tone: "bg-white text-leaf-800 ring-1 ring-leaf-900/10" },
  { id: "planned", label: "Planifiée", emoji: "📅", tone: "bg-sky-100 text-sky-500" },
  { id: "in_progress", label: "En cours", emoji: "🚧", tone: "bg-honey-100 text-honey-600" },
  { id: "done", label: "Faite", emoji: "✅", tone: "bg-leaf-100 text-leaf-700" },
  { id: "dropped", label: "Abandonnée", emoji: "🍂", tone: "bg-leaf-50 text-leaf-900/50" },
];

export function getStatus(id: string | null | undefined) {
  return STATUSES.find((s) => s.id === id) ?? STATUSES[0];
}

/** Score de priorité : privilégie l'impact fort et l'effort faible (de 1 à 8). */
export function priorityScore(a: Pick<GrowthAction, "impact" | "effort">): number {
  return a.impact * 2 + (4 - a.effort) - 1;
}

const STATUS_ORDER: Record<StatusId, number> = { in_progress: 0, planned: 1, idea: 2, done: 3, dropped: 4 };

export function sortActions(actions: GrowthAction[]): GrowthAction[] {
  return [...actions].sort((a, b) => {
    const s = STATUS_ORDER[a.status as StatusId] - STATUS_ORDER[b.status as StatusId];
    if (s !== 0) return s;
    const p = priorityScore(b) - priorityScore(a);
    if (p !== 0) return p;
    return a.created_at.localeCompare(b.created_at);
  });
}

// --- Objectifs ----------------------------------------------------------------------


export type Metric = {
  id: string;
  label: string;
  emoji: string;
  /** Valeur courante calculée depuis l'entonnoir. */
  value: (f: Funnel) => number;
  unit?: string;
};

export const METRICS: Metric[] = [
  { id: "members", label: "Membres inscrits", emoji: "👥", value: (f) => f.members ?? 0 },
  { id: "active_30d", label: "Membres actifs (30 jours)", emoji: "⚡", value: (f) => f.active_30d ?? 0 },
  { id: "seeds", label: "Graines plantées", emoji: "🌱", value: (f) => f.seeds ?? 0 },
  { id: "blooms", label: "Floraisons", emoji: "🌸", value: (f) => f.blooms ?? 0 },
  { id: "pollinations", label: "Pollinisations", emoji: "🐝", value: (f) => f.pollinations ?? 0 },
  { id: "intentions", label: "« Je me lance »", emoji: "🧑‍🌾", value: (f) => f.intentions ?? 0 },
  { id: "ecosystems", label: "Écosystèmes locaux", emoji: "🏡", value: (f) => f.ecosystems ?? 0 },
  { id: "bloom_rate", label: "Taux de floraison", emoji: "🌼", value: (f) => bloomRate(f), unit: "%" },
];

export function getMetric(id: string): Metric {
  return METRICS.find((m) => m.id === id) ?? METRICS[0];
}

/** Part des « Je me lance » qui ont donné une floraison, en pourcentage. */
export function bloomRate(f: Funnel): number {
  const i = f.intentions ?? 0;
  if (i === 0) return 0;
  return Math.round(((f.blooms ?? 0) / i) * 100);
}

export function pct(part: number | null | undefined, whole: number | null | undefined): number {
  if (!whole) return 0;
  return Math.round(((part ?? 0) / whole) * 100);
}

/** Objectifs proposés à la création de l'espace (modifiables ensuite). */
export const DEFAULT_GOALS: { metric: string; target: number; label: string; months: number }[] = [
  { metric: "members", target: 100, label: "Les 100 premiers membres", months: 3 },
  { metric: "active_30d", target: 30, label: "30 membres actifs chaque mois", months: 3 },
  { metric: "seeds", target: 50, label: "50 graines plantées", months: 3 },
  { metric: "blooms", target: 20, label: "20 floraisons", months: 6 },
  { metric: "ecosystems", target: 5, label: "5 communes où ça fleurit", months: 6 },
  { metric: "bloom_rate", target: 30, label: "3 intentions sur 10 fleurissent", months: 6 },
];

// --- Entonnoir d'activation ------------------------------------------------------------

export type FunnelStep = { id: string; label: string; emoji: string; hint: string; value: (f: Funnel) => number };

export const FUNNEL_STEPS: FunnelStep[] = [
  { id: "members", label: "Inscrits", emoji: "👥", hint: "Comptes créés", value: (f) => f.members ?? 0 },
  { id: "with_profile", label: "Profil garni", emoji: "🖼️", hint: "Avatar ou bio renseignés", value: (f) => f.with_profile ?? 0 },
  { id: "following", label: "Suivent quelqu'un", emoji: "🔗", hint: "Au moins un abonnement", value: (f) => f.following_someone ?? 0 },
  { id: "pollinated", label: "Ont pollinisé", emoji: "🐝", hint: "Au moins une pollinisation", value: (f) => f.pollinated ?? 0 },
  { id: "intended", label: "Se sont lancés", emoji: "🧑‍🌾", hint: "Au moins un « Je me lance »", value: (f) => f.intended ?? 0 },
  { id: "planted", label: "Ont planté", emoji: "🌱", hint: "Au moins une graine", value: (f) => f.planted ?? 0 },
  { id: "bloomed", label: "Ont fait fleurir", emoji: "🌸", hint: "Au moins une floraison", value: (f) => f.bloomed ?? 0 },
];

// --- Diagnostic automatique -----------------------------------------------------------

export type Diagnosis = {
  id: string;
  lever: LeverId;
  severity: "info" | "warn" | "good";
  title: string;
  text: string;
  /** Action proposée pour le plan. */
  action?: { title: string; details: string; impact: number; effort: number };
};

/**
 * Règles simples lues sur l'entonnoir. Chaque constat propose une action concrète que
 * l'administrateur peut ajouter au plan en un clic.
 */
export function diagnose(f: Funnel): Diagnosis[] {
  const out: Diagnosis[] = [];
  const members = f.members ?? 0;
  const seeds = f.seeds ?? 0;

  if (members === 0) {
    out.push({
      id: "no-members",
      lever: "acquisition",
      severity: "warn",
      title: "Le jardin est encore vide",
      text: "Aucun membre inscrit : commence par un cercle de 10 à 20 personnes de confiance (famille, voisins, école) qui plantent les premières graines.",
      action: { title: "Recruter le premier cercle de 20 membres", details: "Inviter personnellement 20 personnes proches et leur demander de planter une graine chacune.", impact: 3, effort: 1 },
    });
    return out;
  }

  if ((f.new_7d ?? 0) === 0) {
    out.push({
      id: "no-new",
      lever: "acquisition",
      severity: "warn",
      title: "Aucune inscription cette semaine",
      text: "Sans nouveaux membres, les graines voyagent moins loin. Une publication partagée hors de l'appli (réseaux sociaux, journal communal, école) ramène des curieux.",
      action: { title: "Partager chaque semaine une graine hors de l'appli", details: "Chaque lundi, choisir la graine la plus inspirante et la relayer (réseaux sociaux, newsletter communale, groupe de parents).", impact: 2, effort: 1 },
    });
  }

  const activation = pct(f.planted, members);
  if (members >= 5 && activation < 30) {
    out.push({
      id: "low-activation",
      lever: "activation",
      severity: "warn",
      title: `Seulement ${activation} % des membres ont planté une graine`,
      text: "La première graine est le moment décisif. Proposer une idée toute prête à l'inscription (« Plante ta première graine en 2 minutes ») lève le blocage de la page blanche.",
      action: { title: "Parcours de première graine à l'inscription", details: "Après la confirmation d'e-mail, proposer 3 idées de graines faciles et un bouton « Je l'ai fait, je la plante ».", impact: 3, effort: 2 },
    });
  } else if (members >= 5) {
    out.push({ id: "good-activation", lever: "activation", severity: "good", title: `${activation} % des membres ont planté une graine`, text: "Belle activation : les nouveaux venus passent à l'action." });
  }

  const profile = pct(f.with_profile, members);
  if (members >= 5 && profile < 50) {
    out.push({
      id: "bare-profiles",
      lever: "activation",
      severity: "info",
      title: `${100 - profile} % des profils sont vides`,
      text: "Un avatar et deux lignes de bio rendent les membres identifiables et donnent envie de les suivre.",
      action: { title: "Inviter à compléter son profil après la première graine", details: "Bandeau doux « Ajoute une photo pour que ton écosystème te reconnaisse » tant que le profil est vide.", impact: 1, effort: 1 },
    });
  }

  const following = pct(f.following_someone, members);
  if (members >= 5 && following < 40) {
    out.push({
      id: "no-ecosystem",
      lever: "retention",
      severity: "warn",
      title: `${100 - following} % des membres ne suivent personne`,
      text: "Sans écosystème, le fil « Mon écosystème » reste vide et le membre n'a aucune raison de revenir.",
      action: { title: "Suggérer 5 membres à suivre à l'arrivée", details: "Proposer les pollinisateurs les plus actifs et les membres de la même localité dès la première connexion.", impact: 3, effort: 2 },
    });
  }

  const active = pct(f.active_30d, members);
  if (members >= 10 && active < 25) {
    out.push({
      id: "low-activity",
      lever: "retention",
      severity: "warn",
      title: `${active} % des membres ont été actifs ce mois-ci`,
      text: "Un e-mail hebdomadaire « Ta graine a voyagé » (pollinisations reçues, floraisons inspirées) est le levier de retour le plus simple.",
      action: { title: "E-mail hebdomadaire « Ta graine a voyagé »", details: "Résumé des pollinisations reçues, des « Je me lance » et des floraisons inspirées, avec les 3 nouvelles graines de l'écosystème.", impact: 3, effort: 2 },
    });
  }

  const germinating = f.germinating ?? 0;
  if (germinating >= 3 && bloomRate(f) < 30) {
    out.push({
      id: "germinating",
      lever: "impact",
      severity: "warn",
      title: `${germinating} intention${germinating > 1 ? "s" : ""} « Je me lance » n'ont pas encore fleuri`,
      text: "C'est là que se joue l'impact réel. Un rappel bienveillant quelques jours après l'intention multiplie les floraisons.",
      action: { title: "Rappel J+7 aux membres qui se sont lancés", details: "E-mail ou notification : « Tu voulais reproduire cette action, où en es-tu ? Publie ta floraison en photo ». Proposer aussi un coup de main.", impact: 3, effort: 2 },
    });
  }

  const located = pct(f.seeds_with_location, seeds);
  if (seeds >= 5 && located < 60) {
    out.push({
      id: "no-location",
      lever: "partnership",
      severity: "info",
      title: `${100 - located} % des graines n'ont pas de lieu`,
      text: "Le lieu fait exister les écosystèmes locaux, l'argument décisif pour une commune ou une école partenaire.",
      action: { title: "Rendre le lieu quasi systématique à la plantation", details: "Pré-remplir la localité du profil et la proposer en un clic dans le formulaire « Planter une graine ».", impact: 2, effort: 1 },
    });
  }

  const pictures = pct(f.seeds_with_image, seeds);
  if (seeds >= 5 && pictures < 70) {
    out.push({
      id: "no-image",
      lever: "acquisition",
      severity: "info",
      title: `${100 - pictures} % des graines n'ont pas de photo`,
      text: "Les graines illustrées sont celles qui se partagent et se pollinisent. Une photo prouve aussi que l'action a été réalisée.",
      action: { title: "Encourager la photo à la plantation", details: "Message dans le formulaire : « Une photo multiplie par trois les pollinisations » et aperçu immédiat.", impact: 2, effort: 1 },
    });
  }

  const ecosystems = f.ecosystems ?? 0;
  if (ecosystems < 3) {
    out.push({
      id: "pilot-town",
      lever: "partnership",
      severity: "info",
      title: ecosystems === 0 ? "Aucun écosystème local n'est encore actif" : `${ecosystems} écosystème${ecosystems > 1 ? "s" : ""} local${ecosystems > 1 ? "aux" : ""} seulement`,
      text: "Une commune ou une école pilote concentre les efforts : les graines y fleurissent près de chez soi et l'effet de voisinage joue à plein.",
      action: { title: "Lancer une commune ou une école pilote", details: "Choisir un territoire, obtenir un relais (échevin, direction, association) et organiser un premier défi de plantation collective.", impact: 3, effort: 3 },
    });
  }

  if ((f.open_reports ?? 0) > 0) {
    out.push({
      id: "reports",
      lever: "retention",
      severity: "warn",
      title: `${f.open_reports} signalement${(f.open_reports ?? 0) > 1 ? "s" : ""} en attente`,
      text: "Une communauté sûre est une communauté qui reste. Traiter les signalements dans la console Supabase (table reports, statut open).",
    });
  }

  const returning = f.returning_30d ?? 0;
  if (returning > 0 && members >= 10) {
    out.push({ id: "returning", lever: "retention", severity: "good", title: `${returning} membre${returning > 1 ? "s" : ""} de plus d'un mois ${returning > 1 ? "sont revenus" : "est revenu"} ce mois-ci`, text: "Le réseau retient ses membres : continuons à nourrir leur écosystème." });
  }

  return out;
}

// --- Plan de départ -------------------------------------------------------------------

export type PlaybookItem = { title: string; details: string; lever: LeverId; impact: number; effort: number };

/** Plan de développement proposé quand le plan est vide. */
export const PLAYBOOK: PlaybookItem[] = [
  { lever: "acquisition", impact: 3, effort: 1, title: "Recruter le premier cercle de 20 membres", details: "Inviter personnellement 20 personnes proches, chacune plante une graine la première semaine." },
  { lever: "acquisition", impact: 2, effort: 1, title: "Partager chaque semaine une graine hors de l'appli", details: "Le lundi, relayer la graine la plus inspirante sur les réseaux sociaux, la newsletter communale et les groupes de parents." },
  { lever: "acquisition", impact: 2, effort: 2, title: "Page d'accueil avec témoignages et vraies floraisons", details: "Montrer trois chaînes d'impact réelles (graine → floraisons) plutôt qu'un discours." },
  { lever: "acquisition", impact: 3, effort: 3, title: "Publier l'appli sur Google Play", details: "Finaliser le dossier docs/play-store (identité de l'éditeur, compte développeur, clé de signature)." },
  { lever: "activation", impact: 3, effort: 2, title: "Parcours de première graine à l'inscription", details: "Trois idées faciles proposées après la confirmation d'e-mail, bouton « Je l'ai fait, je la plante »." },
  { lever: "activation", impact: 3, effort: 2, title: "Suggérer 5 membres à suivre à l'arrivée", details: "Pollinisateurs actifs et membres de la même localité, pour que « Mon écosystème » ne soit jamais vide." },
  { lever: "activation", impact: 2, effort: 1, title: "Encourager la photo et le lieu à la plantation", details: "Pré-remplir la localité du profil, aperçu photo immédiat, message « une photo multiplie les pollinisations »." },
  { lever: "retention", impact: 3, effort: 2, title: "E-mail hebdomadaire « Ta graine a voyagé »", details: "Pollinisations reçues, « Je me lance », floraisons inspirées et trois nouvelles graines de l'écosystème." },
  { lever: "retention", impact: 3, effort: 3, title: "Notifications dans l'appli", details: "« Ta graine a fleuri chez @x », « @y s'est lancé », nouveau commentaire. Piste ouverte depuis la refonte." },
  { lever: "retention", impact: 2, effort: 2, title: "Défi mensuel par catégorie", details: "Chaque mois une catégorie à l'honneur (compost en mars, mares en avril…) avec un classement des floraisons." },
  { lever: "referral", impact: 3, effort: 2, title: "Parrainage : invite 3 personnes, deviens Pollinisateur", details: "Lien d'invitation personnel ; les filleuls qui plantent une graine rapportent du pollen au parrain." },
  { lever: "referral", impact: 2, effort: 2, title: "Affiche partageable d'une graine", details: "Image automatique (titre, photo, chaîne d'impact, QR code) à partager sur WhatsApp, Instagram ou à imprimer." },
  { lever: "impact", impact: 3, effort: 2, title: "Rappel J+7 aux membres qui se sont lancés", details: "« Tu voulais reproduire cette action, où en es-tu ? » avec un bouton pour publier la floraison ou demander de l'aide." },
  { lever: "impact", impact: 2, effort: 3, title: "Estimation chiffrée de l'impact par action", details: "Ordres de grandeur par catégorie (kg de déchets, m² de prairie, arbres plantés) affichés sur la chaîne d'impact." },
  { lever: "partnership", impact: 3, effort: 3, title: "Lancer une commune ou une école pilote", details: "Un territoire, un relais local, un premier défi collectif et un tableau d'impact dédié." },
  { lever: "partnership", impact: 2, effort: 2, title: "Kit pour écoles et associations", details: "Guide d'une page, idées de graines par âge, affiche de classe et modèle de message aux parents." },
  { lever: "partnership", impact: 3, effort: 3, title: "Comptes « organisation / commune »", details: "Tableau de bord filtré sur leur territoire ou leurs membres, pour rendre l'impact visible aux partenaires." },
];
