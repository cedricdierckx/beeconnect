"use client";

import { bloomRate, pct, type Funnel, type Weekly } from "@/lib/growth";
import WeekBars from "./WeekBars";

type Props = { funnel: Funnel | null; weeks: Weekly[] };

/** Rythme du réseau : indicateurs de croissance et d'impact, avec l'historique hebdomadaire. */
export default function PulseSection({ funnel, weeks }: Props) {
  const f = funnel;
  const kpis = [
    { emoji: "🆕", label: "nouveaux membres (30 j)", value: f?.new_30d, hint: `${f?.new_7d ?? 0} sur les 7 derniers jours` },
    { emoji: "⚡", label: "membres actifs (30 j)", value: f?.active_30d, hint: `${pct(f?.active_30d, f?.members)} % des inscrits` },
    { emoji: "🔁", label: "membres fidèles", value: f?.returning_30d, hint: "inscrits depuis plus d'un mois et actifs ce mois-ci" },
    { emoji: "🌼", label: "taux de floraison", value: f ? bloomRate(f) : undefined, unit: "%", hint: `${f?.blooms ?? 0} floraisons pour ${f?.intentions ?? 0} « Je me lance »` },
    { emoji: "🐝", label: "pollinisations par graine", value: f && f.seeds ? Math.round(((f.pollinations ?? 0) / f.seeds) * 10) / 10 : 0, hint: `${f?.pollinations ?? 0} pollinisations` },
    { emoji: "🏡", label: "écosystèmes locaux", value: f?.ecosystems, hint: `${pct(f?.seeds_with_location, f?.seeds)} % des graines ont un lieu` },
  ];

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-bold">💓 Le pouls du réseau</h2>
      <p className="mb-4 text-sm text-leaf-900/60">Croissance (qui arrive, qui reste) et impact (ce qui fleurit vraiment).</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl bg-leaf-50 p-3 text-center" title={k.hint}>
            <div className="text-xl">{k.emoji}</div>
            <div className="font-display text-2xl font-bold text-leaf-900">
              {k.value === undefined || k.value === null ? "…" : k.value}
              {k.unit ?? ""}
            </div>
            <div className="text-[11px] font-semibold text-leaf-900/60">{k.label}</div>
            <div className="mt-1 text-[10px] text-leaf-900/40">{k.hint}</div>
          </div>
        ))}
      </div>

      {weeks.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <WeekBars weeks={weeks} metric="new_members" label="Nouveaux membres" />
          <WeekBars weeks={weeks} metric="active_members" label="Membres actifs" />
          <WeekBars weeks={weeks} metric="seeds" label="Graines plantées" />
          <WeekBars weeks={weeks} metric="pollinations" label="Pollinisations" />
          <WeekBars weeks={weeks} metric="intentions" label="« Je me lance »" />
          <WeekBars weeks={weeks} metric="blooms" label="Floraisons" />
        </div>
      )}
      <p className="mt-4 text-xs text-leaf-900/50">
        16 dernières semaines, la semaine en cours en jaune. Un membre est « actif » s&apos;il a planté, commenté, pollinisé ou s&apos;est lancé.
      </p>
    </section>
  );
}
