// Univers EarthConnect : catégories d'actions, statuts de pollinisateur, formatage.

export type Category = {
  id: string;
  label: string;
  emoji: string;
  /** Classes Tailwind pour la pastille (fond + texte). */
  tone: string;
};

export const CATEGORIES: Category[] = [
  { id: "biodiversite", label: "Biodiversité", emoji: "🌼", tone: "bg-honey-100 text-honey-600" },
  { id: "potager", label: "Potager", emoji: "🥕", tone: "bg-orange-100 text-orange-700" },
  { id: "compost", label: "Compost", emoji: "🪱", tone: "bg-amber-100 text-amber-800" },
  { id: "eau", label: "Eau & mares", emoji: "💧", tone: "bg-sky-100 text-sky-500" },
  { id: "nettoyage", label: "Nettoyage", emoji: "🧤", tone: "bg-violet-100 text-violet-700" },
  { id: "mobilite", label: "Mobilité douce", emoji: "🚲", tone: "bg-teal-100 text-teal-700" },
  { id: "dechets", label: "Zéro déchet", emoji: "♻️", tone: "bg-leaf-100 text-leaf-700" },
  { id: "energie", label: "Énergie", emoji: "☀️", tone: "bg-yellow-100 text-yellow-700" },
  { id: "arbres", label: "Arbres & haies", emoji: "🌳", tone: "bg-emerald-100 text-emerald-700" },
  { id: "autre", label: "Autre idée", emoji: "✨", tone: "bg-petal-100 text-petal-500" },
];

export function getCategory(id: string | null | undefined): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

/** Idées de graines suggérées quand le fil est vide ou pour inspirer la création. */
export const SEED_IDEAS = [
  { emoji: "🌼", text: "Transformer une pelouse en prairie fleurie" },
  { emoji: "🐸", text: "Restaurer une mare" },
  { emoji: "🪱", text: "Installer un compost" },
  { emoji: "🥕", text: "Créer un potager collectif" },
  { emoji: "🧤", text: "Organiser un nettoyage citoyen" },
  { emoji: "🚲", text: "Aller à l'école à vélo" },
  { emoji: "🐞", text: "Construire un hôtel à insectes" },
  { emoji: "☀️", text: "Rénover énergétiquement un bâtiment" },
];

export type ProfileCounts = {
  seeds_count: number;
  blooms_count: number;
  pollinations_given: number;
  intentions_count: number;
  blooms_inspired: number;
};

export type Level = {
  rank: number;
  name: string;
  emoji: string;
  min: number;
  description: string;
};

export const LEVELS: Level[] = [
  { rank: 0, name: "Explorateur", emoji: "🔎", min: 0, description: "Découvre ses premières initiatives." },
  { rank: 1, name: "Pollinisateur", emoji: "🐝", min: 40, description: "Contribue régulièrement à la diffusion des bonnes idées." },
  { rank: 2, name: "Pollinisateur local", emoji: "🏡", min: 150, description: "Mobilise sa communauté." },
  { rank: 3, name: "Grand Pollinisateur", emoji: "🌻", min: 400, description: "Déclenche de nombreuses réalisations." },
  { rank: 4, name: "Gardien de l'écosystème", emoji: "🌳", min: 1000, description: "Anime durablement une communauté positive." },
];

/**
 * Points de pollen : récompensent davantage ce qui transforme l'inspiration en action
 * réelle (floraisons, réalisations inspirées) que la simple diffusion.
 */
export function pollenPoints(c: ProfileCounts): number {
  return (
    c.pollinations_given * 2 +
    c.intentions_count * 5 +
    c.seeds_count * 10 +
    c.blooms_count * 25 +
    c.blooms_inspired * 40
  );
}

export function levelFor(points: number) {
  let current = LEVELS[0];
  for (const level of LEVELS) if (points >= level.min) current = level;
  const next = LEVELS.find((l) => l.rank === current.rank + 1) ?? null;
  const progress = next ? (points - current.min) / (next.min - current.min) : 1;
  return { current, next, progress: Math.max(0, Math.min(1, progress)) };
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")} M`;
  if (n >= 10_000) return `${Math.round(n / 1000)} k`;
  return n.toLocaleString("fr-BE");
}

export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `il y a ${Math.floor(diff / 86400)} j`;
  return new Date(iso).toLocaleDateString("fr-BE", { day: "numeric", month: "short" });
}
