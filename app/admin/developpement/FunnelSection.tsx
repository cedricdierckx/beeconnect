"use client";

import { FUNNEL_STEPS, pct, type Funnel } from "@/lib/growth";

/** Parcours des membres : combien franchissent chaque étape, et où l'on en perd le plus. */
export default function FunnelSection({ funnel }: { funnel: Funnel | null }) {
  const members = funnel?.members ?? 0;
  const steps = FUNNEL_STEPS.map((s) => ({ ...s, count: funnel ? s.value(funnel) : 0 }));
  // Plus grande chute en points de pourcentage entre deux étapes successives (hors première).
  let worst: string | null = null;
  let worstDrop = 0;
  for (let i = 1; i < steps.length; i++) {
    const drop = pct(steps[i - 1].count, members) - pct(steps[i].count, members);
    if (drop > worstDrop) {
      worstDrop = drop;
      worst = steps[i].id;
    }
  }

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-bold">🪜 Le parcours des membres</h2>
      <p className="mb-4 text-sm text-leaf-900/60">
        Part des inscrits qui ont franchi chaque étape. La marche la plus haute est celle où l&apos;on perd le plus de monde.
      </p>
      {members === 0 ? (
        <p className="text-leaf-900/50">Le parcours se dessinera avec les premiers inscrits.</p>
      ) : (
        <ol className="space-y-2">
          {steps.map((s) => {
            const share = pct(s.count, members);
            const highlight = s.id === worst && members >= 5;
            return (
              <li key={s.id} className={`rounded-2xl p-2 ${highlight ? "bg-honey-50 ring-1 ring-honey-200" : ""}`}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold" title={s.hint}>
                    {s.emoji} {s.label}
                    {highlight && <span className="ml-2 chip bg-honey-100 px-2 py-0 text-[11px] text-honey-600">⚠️ plus grosse perte</span>}
                  </span>
                  <span className="text-leaf-900/60">
                    <b className="font-display text-leaf-900">{s.count}</b> · {share} %
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-leaf-50">
                  <div className="h-full rounded-full bg-leaf-400" style={{ width: `${share}%` }} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
