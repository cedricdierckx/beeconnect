"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { formatCount } from "@/lib/earth";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toaster";

const TIP_KEY = "earthconnect:pollinate-tip-seen";

type Particle = { id: number; dx: number; dy: number; size: number; color: string };

/**
 * Bouton central d'EarthConnect : « Polliniser » remplace le « J'aime ».
 * Props : `postId`, `count` (pollinisations actuelles), `pollinated` (état pour l'utilisateur courant),
 * `tip` (bulle d'explication à la première visite).
 */
export default function PollinateButton({
  postId,
  count,
  pollinated,
  big = false,
  tip = false,
  onChange,
}: {
  postId: string;
  count: number;
  pollinated: boolean;
  big?: boolean;
  /** Affiche l'explication « Polliniser » à la première visite. */
  tip?: boolean;
  onChange?: (pollinated: boolean) => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [state, setState] = useState({ pollinated, count });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [busy, setBusy] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => setState({ pollinated, count }), [pollinated, count]);

  useEffect(() => {
    if (!tip) return;
    try {
      if (!localStorage.getItem(TIP_KEY)) setShowTip(true);
    } catch {
      /* stockage indisponible */
    }
  }, [tip]);

  function burst() {
    const colors = ["#FFC93C", "#F5B014", "#FFE287", "#3FB46C", "#FF9EBB"];
    const ps = Array.from({ length: 14 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
      const dist = 30 + Math.random() * 35;
      return {
        id: Date.now() + i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 4 + Math.random() * 6,
        color: colors[i % colors.length],
      };
    });
    setParticles(ps);
    setTimeout(() => setParticles([]), 900);
  }

  function dismissTip() {
    setShowTip(false);
    try {
      localStorage.setItem(TIP_KEY, "1");
    } catch {
      /* stockage indisponible */
    }
  }

  async function toggle() {
    dismissTip();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !state.pollinated;
    setState((s) => ({ pollinated: next, count: s.count + (next ? 1 : -1) }));
    if (next) burst();

    const { error } = next
      ? await supabase.from("pollinations").upsert(
          { post_id: postId, user_id: user.id },
          { onConflict: "post_id,user_id", ignoreDuplicates: true },
        )
      : await supabase.from("pollinations").delete().eq("post_id", postId).eq("user_id", user.id);

    if (error) {
      setState((s) => ({ pollinated: !next, count: s.count + (next ? -1 : 1) }));
      toast("Oups, la pollinisation n'a pas pris. Réessaie !", "🥀");
    } else {
      onChange?.(next);
      if (next) toast("Idée pollinisée ! Elle voyage vers ton écosystème", "🐝");
    }
    setBusy(false);
  }

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={state.pollinated}
        title="Polliniser : aider cette idée à voyager et à inspirer d'autres personnes"
        className={`relative inline-flex items-center gap-2 rounded-full font-display font-semibold transition active:scale-95 ${
          big ? "px-6 py-3 text-lg" : "px-4 py-2 text-sm"
        } ${
          state.pollinated
            ? "bg-honey-400 text-leaf-900 shadow-[0_3px_0_0_#D48F00]"
            : "bg-honey-50 text-leaf-800 ring-2 ring-honey-300 hover:bg-honey-100"
        }`}
      >
        <span className={`relative ${big ? "text-2xl" : "text-lg"}`}>
          <span className={state.pollinated ? "inline-block animate-wiggle" : "inline-block"}>🐝</span>
          {particles.length > 0 && (
            <span className="pointer-events-none absolute left-1/2 top-1/2 inline-block animate-flyaway">🐝</span>
          )}
          {particles.map((p) => (
            <span
              key={p.id}
              className="pointer-events-none absolute left-1/2 top-1/2 animate-pollen rounded-full"
              style={
                {
                  width: p.size,
                  height: p.size,
                  marginLeft: -p.size / 2,
                  marginTop: -p.size / 2,
                  background: p.color,
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
        {state.pollinated ? "Pollinisé" : "Polliniser"}
        <span className={`rounded-full px-2 py-0.5 text-xs ${state.pollinated ? "bg-white/50" : "bg-white"}`}>
          {formatCount(state.count)}
        </span>
      </button>

      {showTip && (
        <div className="absolute bottom-full left-0 z-20 mb-3 w-64 animate-popin rounded-2xl bg-leaf-800 p-4 text-sm text-white shadow-soft">
          <p className="font-display font-semibold">🐝 Nouveau ici ?</p>
          <p className="mt-1 text-white/90">
            Polliniser une action, c&apos;est l&apos;aider à voyager et à inspirer d&apos;autres personnes.
          </p>
          <button onClick={dismissTip} className="mt-2 font-display font-semibold text-honey-300 hover:underline">
            Compris !
          </button>
          <span className="absolute -bottom-1.5 left-8 h-3 w-3 rotate-45 bg-leaf-800" />
        </div>
      )}
    </div>
  );
}
