import { LEVELS, levelFor, pollenPoints, type ProfileCounts } from "@/lib/earth";

/** Statut de pollinisateur (Explorateur → Gardien de l'écosystème) avec progression. */
export default function LevelBadge({ counts, ladder = false }: { counts: ProfileCounts; ladder?: boolean }) {
  const points = pollenPoints(counts);
  const { current, next, progress } = levelFor(points);
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-honey-300 text-2xl shadow-[0_3px_0_0_#D48F00]">
          {current.emoji}
        </span>
        <div className="flex-1">
          <p className="font-display text-lg font-bold leading-tight">{current.name}</p>
          <p className="text-xs text-leaf-900/60">{current.description}</p>
        </div>
        <span className="chip bg-honey-100 text-honey-600">✨ {points} pollen</span>
      </div>
      {next && (
        <div className="mt-3">
          <div className="h-3 overflow-hidden rounded-full bg-leaf-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-honey-400 to-leaf-400 transition-all duration-700"
              style={{ width: `${Math.max(4, progress * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-leaf-900/50">
            Encore {next.min - points} pollen pour devenir {next.emoji} {next.name}
          </p>
        </div>
      )}
      {ladder && (
        <ol className="mt-4 grid grid-cols-5 gap-1 text-center">
          {LEVELS.map((l) => (
            <li key={l.rank} className={`rounded-xl p-2 ${l.rank <= current.rank ? "bg-leaf-100" : "bg-leaf-50 opacity-50 grayscale"}`}>
              <span className="text-xl">{l.emoji}</span>
              <span className="block text-[10px] font-semibold leading-tight">{l.name}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
