"use client";

import type { Weekly } from "@/lib/growth";

type Props = {
  weeks: Weekly[];
  metric: keyof Omit<Weekly, "week_start">;
  label: string;
  /** Classe Tailwind de la couleur des barres (une seule teinte par graphique). */
  tone?: string;
};

function weekLabel(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-BE", { day: "numeric", month: "short" });
}

/**
 * Barres hebdomadaires (16 semaines) : une seule série, une seule teinte, bulle d'info au
 * survol de chaque barre et tableau équivalent pour les lecteurs d'écran.
 */
export default function WeekBars({ weeks, metric, label, tone = "bg-leaf-400" }: Props) {
  const values = weeks.map((w) => w[metric] ?? 0);
  const max = Math.max(1, ...values);
  const last = values[values.length - 1] ?? 0;
  const previous = values[values.length - 2] ?? 0;
  const trend = last - previous;

  return (
    <figure>
      <div className="flex items-baseline justify-between">
        <figcaption className="font-display text-sm font-semibold text-leaf-800">{label}</figcaption>
        <span className="text-xs text-leaf-900/60" title="Cette semaine, comparée à la semaine précédente">
          <b className="font-display text-base text-leaf-900">{last}</b>{" "}
          {trend > 0 ? `▲ +${trend}` : trend < 0 ? `▼ ${trend}` : "="}
        </span>
      </div>
      <div className="mt-2 flex h-16 items-end gap-0.5" aria-hidden>
        {weeks.map((w, i) => {
          const v = values[i];
          const current = i === weeks.length - 1;
          return (
            <div
              key={w.week_start ?? i}
              className="group relative flex-1"
              title={`Semaine du ${weekLabel(w.week_start)} : ${v}`}
            >
              <div
                className={`w-full rounded-t ${current ? "bg-honey-400" : tone} transition group-hover:opacity-80`}
                style={{ height: `${Math.max(v > 0 ? 8 : 2, (v / max) * 100)}%`, minHeight: 2 }}
              />
            </div>
          );
        })}
      </div>
      <table className="sr-only">
        <caption>{label}, par semaine</caption>
        <thead>
          <tr>
            <th>Semaine du</th>
            <th>{label}</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w, i) => (
            <tr key={w.week_start ?? i}>
              <td>{weekLabel(w.week_start)}</td>
              <td>{values[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
