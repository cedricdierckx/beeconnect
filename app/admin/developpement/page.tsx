"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { LEVERS, type Funnel, type GrowthAction, type GrowthGoal, type Weekly } from "@/lib/growth";
import { useAuth } from "@/app/components/AuthProvider";
import GoalsSection from "./GoalsSection";
import PulseSection from "./PulseSection";
import FunnelSection from "./FunnelSection";
import DiagnosisSection from "./DiagnosisSection";
import PlanSection from "./PlanSection";

/**
 * Développement du réseau : tout ce qui sert à avoir plus de membres et plus d'impact
 * positif. Les chiffres viennent des vues growth_funnel / growth_weekly, les objectifs et
 * le plan des tables growth_goals / growth_actions (réservées aux administrateurs).
 */
export default function GrowthPage() {
  const { user } = useAuth();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [weeks, setWeeks] = useState<Weekly[]>([]);
  const [goals, setGoals] = useState<GrowthGoal[]>([]);
  const [actions, setActions] = useState<GrowthAction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    const [{ data: g }, { data: a }] = await Promise.all([
      supabase.from("growth_goals").select("*").order("deadline", { ascending: true, nullsFirst: false }).order("created_at"),
      supabase.from("growth_actions").select("*"),
    ]);
    setGoals(g ?? []);
    setActions(a ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      const [{ data: f, error: fe }, { data: w, error: we }] = await Promise.all([
        supabase.from("growth_funnel").select("*").maybeSingle(),
        supabase.from("growth_weekly").select("*").order("week_start"),
      ]);
      if (fe || we) setError((fe ?? we)?.message ?? "erreur inconnue");
      setFunnel(f);
      setWeeks(w ?? []);
      await loadPlan();
    })();
  }, [loadPlan]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header className="card relative overflow-hidden bg-gradient-to-br from-honey-300 via-honey-400 to-honey-500 p-6 sm:p-8">
        <span className="absolute -right-4 -top-4 animate-float text-8xl opacity-30">🚀</span>
        <h1 className="text-3xl font-bold text-leaf-900 sm:text-4xl">Développement du réseau</h1>
        <p className="mt-2 max-w-2xl text-leaf-900/80">
          Plus de membres, et surtout plus d&apos;actions qui fleurissent vraiment. Six leviers, un cap chiffré, un
          diagnostic lu sur les chiffres et un plan d&apos;actions partagé entre administrateurs.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {LEVERS.map((l) => (
            <li key={l.id} className="chip bg-white/80 text-leaf-900" title={l.question}>
              {l.emoji} {l.label}
            </li>
          ))}
        </ul>
      </header>

      {error && (
        <div className="card border-l-8 border-honey-400 p-5">
          <h2 className="text-lg font-bold">⚠️ Données indisponibles</h2>
          <p className="mt-1 text-sm text-leaf-900/70">
            {error}. La migration <code className="rounded bg-leaf-50 px-1">20261019100000_earthconnect_admin_space.sql</code>{" "}
            doit être appliquée dans la console Supabase (voir <code>docs/DATABASE.md</code>).
          </p>
        </div>
      )}

      <GoalsSection funnel={funnel} goals={goals} userId={user.id} onChange={loadPlan} />
      <PulseSection funnel={funnel} weeks={weeks} />
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <FunnelSection funnel={funnel} />
        <DiagnosisSection funnel={funnel} actions={actions} userId={user.id} onChange={loadPlan} />
      </div>
      <PlanSection actions={actions} userId={user.id} onChange={loadPlan} />
    </div>
  );
}
