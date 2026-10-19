"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { DEFAULT_GOALS, METRICS, getMetric, type Funnel, type GrowthGoal } from "@/lib/growth";
import { useToast } from "@/app/components/Toaster";

type Props = {
  funnel: Funnel | null;
  goals: GrowthGoal[];
  userId: string;
  onChange: () => Promise<void>;
};

function daysLeft(deadline: string | null): number | null {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

function inMonths(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export default function GoalsSection({ funnel, goals, userId, onChange }: Props) {
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [metric, setMetric] = useState("members");
  const [target, setTarget] = useState("100");
  const [deadline, setDeadline] = useState(inMonths(3));
  const [label, setLabel] = useState("");

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    const t = Number(target);
    if (!t || t <= 0) return toast("Indique une cible supérieure à zéro.", "🎯");
    setBusy(true);
    const { error } = await supabase.from("growth_goals").insert({
      metric,
      target: t,
      deadline: deadline || null,
      label: label.trim() || null,
      created_by: userId,
    });
    setBusy(false);
    if (error) return toast(`Impossible d'enregistrer : ${error.message}`, "🥀");
    toast("Objectif ajouté", "🎯");
    setAdding(false);
    setLabel("");
    await onChange();
  }

  async function removeGoal(id: string) {
    const { error } = await supabase.from("growth_goals").delete().eq("id", id);
    if (error) return toast(`Suppression impossible : ${error.message}`, "🥀");
    await onChange();
  }

  async function importDefaults() {
    setBusy(true);
    const { error } = await supabase.from("growth_goals").insert(
      DEFAULT_GOALS.map((g) => ({ metric: g.metric, target: g.target, label: g.label, deadline: inMonths(g.months), created_by: userId })),
    );
    setBusy(false);
    if (error) return toast(`Import impossible : ${error.message}`, "🥀");
    toast("Objectifs de départ ajoutés", "🎯");
    await onChange();
  }

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">🎯 Le cap</h2>
          <p className="text-sm text-leaf-900/60">Des objectifs chiffrés et datés, suivis en direct.</p>
        </div>
        <button type="button" className="btn-ghost py-2 text-sm" onClick={() => setAdding((v) => !v)}>
          {adding ? "Fermer" : "➕ Nouvel objectif"}
        </button>
      </div>

      {adding && (
        <form onSubmit={addGoal} className="mt-4 grid gap-3 rounded-2xl bg-leaf-50 p-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="goal-metric">Indicateur</label>
            <select id="goal-metric" className="input" value={metric} onChange={(e) => setMetric(e.target.value)}>
              {METRICS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="goal-target">Cible</label>
            <input id="goal-target" type="number" min={1} step="any" className="input" value={target} onChange={(e) => setTarget(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="goal-deadline">Échéance</label>
            <input id="goal-deadline" type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="goal-label">Intitulé (facultatif)</label>
            <input id="goal-label" className="input" maxLength={120} placeholder="Les 100 premiers membres" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={busy} className="btn-primary">
              Enregistrer l&apos;objectif
            </button>
          </div>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-honey-50 p-5 text-center">
          <p className="font-display font-semibold">Aucun objectif pour l&apos;instant.</p>
          <p className="mt-1 text-sm text-leaf-900/60">
            Commence avec {DEFAULT_GOALS.length} objectifs de départ (membres, actifs, graines, floraisons, communes, taux de floraison), modifiables ensuite.
          </p>
          <button type="button" disabled={busy} className="btn-honey mt-3" onClick={importDefaults}>
            🎯 Charger les objectifs de départ
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => {
            const m = getMetric(g.metric);
            const value = funnel ? m.value(funnel) : 0;
            const ratio = Math.min(1, value / Number(g.target));
            const days = daysLeft(g.deadline);
            const reached = ratio >= 1;
            return (
              <li key={g.id} className={`relative rounded-2xl p-4 ring-1 ${reached ? "bg-leaf-50 ring-leaf-200" : "bg-white ring-leaf-900/5"}`}>
                <button
                  type="button"
                  aria-label="Supprimer cet objectif"
                  title="Supprimer"
                  className="absolute right-2 top-2 rounded-full px-2 text-leaf-900/40 hover:bg-leaf-50 hover:text-leaf-900"
                  onClick={() => removeGoal(g.id)}
                >
                  ×
                </button>
                <p className="pr-6 font-display font-semibold">
                  {m.emoji} {g.label || m.label}
                </p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {value}
                  {m.unit ?? ""} <span className="text-base font-semibold text-leaf-900/50">/ {Number(g.target)}{m.unit ?? ""}</span>
                </p>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-leaf-50" role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div className={`h-full rounded-full ${reached ? "bg-leaf-500" : "bg-honey-400"}`} style={{ width: `${ratio * 100}%` }} />
                </div>
                <p className="mt-2 text-xs text-leaf-900/60">
                  {reached
                    ? "🎉 Objectif atteint !"
                    : days === null
                      ? `${Math.round(ratio * 100)} % · sans échéance`
                      : days < 0
                        ? `${Math.round(ratio * 100)} % · échéance dépassée de ${-days} j`
                        : `${Math.round(ratio * 100)} % · ${days} jour${days > 1 ? "s" : ""} restant${days > 1 ? "s" : ""}`}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
