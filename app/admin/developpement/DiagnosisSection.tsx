"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { diagnose, getLever, type Diagnosis, type Funnel, type GrowthAction } from "@/lib/growth";
import { useToast } from "@/app/components/Toaster";

type Props = { funnel: Funnel | null; actions: GrowthAction[]; userId: string; onChange: () => Promise<void> };

const SEVERITY = {
  warn: { emoji: "🔥", tone: "border-petal-300" },
  info: { emoji: "💡", tone: "border-sky-300" },
  good: { emoji: "🌟", tone: "border-leaf-300" },
};

/** Constats lus sur les chiffres, chacun avec une action à ajouter au plan en un clic. */
export default function DiagnosisSection({ funnel, actions, userId, onChange }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const items = funnel ? diagnose(funnel) : [];
  const existing = new Set(actions.map((a) => a.title.trim().toLowerCase()));

  async function addToPlan(d: Diagnosis) {
    if (!d.action) return;
    setBusy(d.id);
    const { error } = await supabase.from("growth_actions").insert({
      title: d.action.title,
      details: d.action.details,
      lever: d.lever,
      impact: d.action.impact,
      effort: d.action.effort,
      status: "planned",
      created_by: userId,
    });
    setBusy(null);
    if (error) return toast(`Impossible d'ajouter : ${error.message}`, "🥀");
    toast("Ajoutée au plan", "📅");
    await onChange();
  }

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-bold">🩺 Diagnostic</h2>
      <p className="mb-4 text-sm text-leaf-900/60">
        Ce que les chiffres suggèrent, et l&apos;action qui va avec. Les règles sont dans <code>lib/growth.ts</code>.
      </p>
      {!funnel ? (
        <p className="text-leaf-900/50">En attente des données.</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl bg-leaf-50 p-4 text-sm font-semibold text-leaf-700">🌟 Rien à signaler : le jardin pousse bien.</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {items.map((d) => {
            const lever = getLever(d.lever);
            const sev = SEVERITY[d.severity];
            const already = d.action ? existing.has(d.action.title.trim().toLowerCase()) : false;
            return (
              <li key={d.id} className={`rounded-2xl border-l-8 bg-white p-4 ring-1 ring-leaf-900/5 ${sev.tone}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display font-semibold">
                    {sev.emoji} {d.title}
                  </p>
                  <span className={`chip shrink-0 px-2 py-0.5 text-[11px] ${lever.tone}`}>
                    {lever.emoji} {lever.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-leaf-900/70">{d.text}</p>
                {d.action && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm">
                      👉 <b className="font-display">{d.action.title}</b>
                    </span>
                    {already ? (
                      <span className="chip bg-leaf-50 px-2 py-0.5 text-[11px] text-leaf-700">✅ déjà dans le plan</span>
                    ) : (
                      <button type="button" disabled={busy === d.id} className="btn-ghost px-3 py-1 text-xs" onClick={() => addToPlan(d)}>
                        ➕ Ajouter au plan
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
