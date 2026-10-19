"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  LEVERS,
  PLAYBOOK,
  STATUSES,
  getLever,
  getStatus,
  priorityScore,
  sortActions,
  type GrowthAction,
  type LeverId,
  type StatusId,
} from "@/lib/growth";
import { useToast } from "@/app/components/Toaster";

type Props = { actions: GrowthAction[]; userId: string; onChange: () => Promise<void> };

type Draft = { title: string; details: string; lever: LeverId; impact: number; effort: number; owner: string; due_date: string };

const EMPTY: Draft = { title: "", details: "", lever: "acquisition", impact: 2, effort: 2, owner: "", due_date: "" };

function Dots({ n, label }: { n: number; label: string }) {
  return (
    <span title={`${label} : ${n}/3`} aria-label={`${label} ${n} sur 3`} className="font-mono text-xs tracking-tighter">
      {"●".repeat(n)}
      <span className="text-leaf-900/20">{"●".repeat(3 - n)}</span>
    </span>
  );
}

/** Plan de développement : les actions par levier, priorisées, avec leur statut. */
export default function PlanSection({ actions, userId, onChange }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [filterLever, setFilterLever] = useState<LeverId | "all">("all");
  const [showClosed, setShowClosed] = useState(false);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const visible = sortActions(actions).filter(
    (a) => (filterLever === "all" || a.lever === filterLever) && (showClosed || (a.status !== "done" && a.status !== "dropped")),
  );
  const closedCount = actions.filter((a) => a.status === "done" || a.status === "dropped").length;

  function startNew() {
    setDraft(EMPTY);
    setEditing("new");
  }

  function startEdit(a: GrowthAction) {
    setDraft({
      title: a.title,
      details: a.details ?? "",
      lever: a.lever as LeverId,
      impact: a.impact,
      effort: a.effort,
      owner: a.owner ?? "",
      due_date: a.due_date ?? "",
    });
    setEditing(a.id);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return toast("Donne un titre à l'action.", "✏️");
    setBusy(true);
    const payload = {
      title: draft.title.trim(),
      details: draft.details.trim() || null,
      lever: draft.lever,
      impact: draft.impact,
      effort: draft.effort,
      owner: draft.owner.trim() || null,
      due_date: draft.due_date || null,
    };
    const { error } =
      editing === "new"
        ? await supabase.from("growth_actions").insert({ ...payload, created_by: userId })
        : await supabase.from("growth_actions").update(payload).eq("id", editing ?? "");
    setBusy(false);
    if (error) return toast(`Enregistrement impossible : ${error.message}`, "🥀");
    toast(editing === "new" ? "Action ajoutée au plan" : "Action mise à jour", "📝");
    setEditing(null);
    await onChange();
  }

  async function setStatus(a: GrowthAction, status: StatusId) {
    const { error } = await supabase.from("growth_actions").update({ status }).eq("id", a.id);
    if (error) return toast(`Changement impossible : ${error.message}`, "🥀");
    if (status === "done") toast("Bravo, une action de plus qui fleurit !", "🌸");
    await onChange();
  }

  async function remove(a: GrowthAction) {
    if (!window.confirm(`Supprimer « ${a.title} » du plan ?`)) return;
    const { error } = await supabase.from("growth_actions").delete().eq("id", a.id);
    if (error) return toast(`Suppression impossible : ${error.message}`, "🥀");
    await onChange();
  }

  async function importPlaybook() {
    setBusy(true);
    const existing = new Set(actions.map((a) => a.title.trim().toLowerCase()));
    const rows = PLAYBOOK.filter((p) => !existing.has(p.title.trim().toLowerCase())).map((p) => ({ ...p, created_by: userId }));
    if (rows.length === 0) {
      setBusy(false);
      return toast("Le plan de départ est déjà chargé.", "📋");
    }
    const { error } = await supabase.from("growth_actions").insert(rows);
    setBusy(false);
    if (error) return toast(`Import impossible : ${error.message}`, "🥀");
    toast(`${rows.length} actions ajoutées au plan`, "📋");
    await onChange();
  }

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">📋 Le plan de développement</h2>
          <p className="text-sm text-leaf-900/60">
            Une action = un levier, un impact espéré, un effort. Les actions à fort impact et faible effort passent devant.
          </p>
        </div>
        <div className="flex gap-2">
          {actions.length > 0 && (
            <button type="button" disabled={busy} className="btn-ghost py-2 text-sm" onClick={importPlaybook} title="Ajoute les actions du plan de départ qui ne sont pas encore dans le plan">
              📋 Plan de départ
            </button>
          )}
          <button type="button" className="btn-primary py-2 text-sm" onClick={startNew}>
            ➕ Nouvelle action
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setFilterLever("all")} className={`chip ${filterLever === "all" ? "bg-leaf-800 text-white" : "bg-white ring-1 ring-leaf-900/10"}`}>
          Tous les leviers
        </button>
        {LEVERS.map((l) => {
          const n = actions.filter((a) => a.lever === l.id && a.status !== "done" && a.status !== "dropped").length;
          return (
            <button
              key={l.id}
              type="button"
              title={l.question}
              onClick={() => setFilterLever(l.id)}
              className={`chip ${filterLever === l.id ? "bg-leaf-800 text-white" : l.tone}`}
            >
              {l.emoji} {l.label} {n > 0 && <span className="rounded-full bg-white/70 px-1.5 text-[11px] text-leaf-900">{n}</span>}
            </button>
          );
        })}
        {closedCount > 0 && (
          <label className="ml-auto flex items-center gap-2 text-sm text-leaf-900/60">
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
            Afficher les {closedCount} terminée{closedCount > 1 ? "s" : ""}
          </label>
        )}
      </div>

      {editing && (
        <form onSubmit={save} className="mt-4 grid gap-3 rounded-2xl bg-leaf-50 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="action-title">Action</label>
            <input id="action-title" className="input" maxLength={160} required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ex. : lancer une école pilote" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="action-details">Détails</label>
            <textarea id="action-details" className="input" rows={3} maxLength={2000} value={draft.details} onChange={(e) => setDraft({ ...draft, details: e.target.value })} placeholder="Comment, avec qui, premier pas concret…" />
          </div>
          <div>
            <label className="label" htmlFor="action-lever">Levier</label>
            <select id="action-lever" className="input" value={draft.lever} onChange={(e) => setDraft({ ...draft, lever: e.target.value as LeverId })}>
              {LEVERS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.emoji} {l.label} — {l.question}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="action-impact">Impact espéré</label>
              <select id="action-impact" className="input" value={draft.impact} onChange={(e) => setDraft({ ...draft, impact: Number(e.target.value) })}>
                <option value={1}>● faible</option>
                <option value={2}>●● moyen</option>
                <option value={3}>●●● fort</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="action-effort">Effort</label>
              <select id="action-effort" className="input" value={draft.effort} onChange={(e) => setDraft({ ...draft, effort: Number(e.target.value) })}>
                <option value={1}>● léger</option>
                <option value={2}>●● moyen</option>
                <option value={3}>●●● lourd</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="action-owner">Qui s&apos;en charge</label>
            <input id="action-owner" className="input" maxLength={80} value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} placeholder="Prénom, rôle ou organisation" />
          </div>
          <div>
            <label className="label" htmlFor="action-due">Échéance</label>
            <input id="action-due" type="date" className="input" value={draft.due_date} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={busy} className="btn-primary">
              {editing === "new" ? "Ajouter au plan" : "Enregistrer"}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {actions.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-honey-50 p-5 text-center">
          <p className="font-display font-semibold">Le plan est vide.</p>
          <p className="mt-1 text-sm text-leaf-900/60">
            Charge le plan de départ : {PLAYBOOK.length} actions réparties sur les six leviers, à trier, adapter ou supprimer.
          </p>
          <button type="button" disabled={busy} className="btn-honey mt-3" onClick={importPlaybook}>
            📋 Charger le plan de départ
          </button>
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-4 text-leaf-900/50">Aucune action pour ce filtre.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {visible.map((a) => {
            const lever = getLever(a.lever);
            const status = getStatus(a.status);
            const late = a.due_date && a.status !== "done" && a.status !== "dropped" && new Date(a.due_date).getTime() < Date.now();
            return (
              <li key={a.id} className={`rounded-2xl p-4 ring-1 ring-leaf-900/5 ${a.status === "in_progress" ? "bg-honey-50" : "bg-white"}`}>
                <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                  <span className={`chip px-2 py-0.5 text-[11px] ${lever.tone}`}>
                    {lever.emoji} {lever.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-display font-semibold ${a.status === "done" ? "line-through opacity-60" : ""}`}>{a.title}</p>
                    {a.details && <p className="mt-0.5 text-sm text-leaf-900/70">{a.details}</p>}
                    <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-leaf-900/60">
                      <span>
                        impact <Dots n={a.impact} label="Impact" />
                      </span>
                      <span>
                        effort <Dots n={a.effort} label="Effort" />
                      </span>
                      <span title="Score de priorité (impact ×2 + facilité)">priorité {priorityScore(a)}/8</span>
                      {a.owner && <span>👤 {a.owner}</span>}
                      {a.due_date && (
                        <span className={late ? "font-semibold text-petal-500" : ""}>
                          📅 {new Date(a.due_date).toLocaleDateString("fr-BE", { day: "numeric", month: "short", year: "numeric" })}
                          {late && " (en retard)"}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      aria-label="Statut"
                      className={`chip cursor-pointer appearance-none border-0 px-3 py-1 text-xs ${status.tone}`}
                      value={a.status}
                      onChange={(e) => setStatus(a, e.target.value as StatusId)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.emoji} {s.label}
                        </option>
                      ))}
                    </select>
                    <button type="button" aria-label="Modifier" title="Modifier" className="rounded-full px-2 py-1 hover:bg-leaf-50" onClick={() => startEdit(a)}>
                      ✏️
                    </button>
                    <button type="button" aria-label="Supprimer" title="Supprimer" className="rounded-full px-2 py-1 text-leaf-900/40 hover:bg-leaf-50 hover:text-leaf-900" onClick={() => remove(a)}>
                      ×
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
