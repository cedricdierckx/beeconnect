import { formatCount } from "@/lib/earth";
import type { PostStats } from "@/lib/posts";

const METRICS = [
  { key: "views_count", emoji: "👀", one: "personne touchée", many: "personnes touchées" },
  { key: "pollinations_count", emoji: "🐝", one: "pollinisation", many: "pollinisations" },
  { key: "intentions_count", emoji: "🌱", one: "s'est lancé", many: "se sont lancés" },
  { key: "blooms_count", emoji: "🌸", one: "réalisation confirmée", many: "réalisations confirmées" },
] as const;

/** Les quatre niveaux d'impact d'une graine : touchés, pollinisations, intentions, floraisons. */
export default function ImpactStats({ stats, compact = false }: { stats: PostStats; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-leaf-900/60">
        {METRICS.map((m) => (
          <span key={m.key} title={stats[m.key] === 1 ? m.one : m.many}>
            {m.emoji} <b className="font-display text-leaf-800">{formatCount(stats[m.key])}</b>
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {METRICS.map((m, i) => (
        <div
          key={m.key}
          className={`rounded-2xl p-4 text-center ${
            ["bg-sky-100", "bg-honey-100", "bg-leaf-100", "bg-petal-100"][i]
          }`}
        >
          <div className="text-2xl">{m.emoji}</div>
          <div className="font-display text-2xl font-bold text-leaf-900">{formatCount(stats[m.key])}</div>
          <div className="text-xs font-semibold text-leaf-900/60">{stats[m.key] === 1 ? m.one : m.many}</div>
        </div>
      ))}
    </div>
  );
}
