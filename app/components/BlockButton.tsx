"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toaster";

/**
 * Bloquer / débloquer un membre : ses graines et commentaires sont masqués pour soi.
 * Masqué sur son propre profil. Props : `profileId`, `username` (pour les messages).
 */
export default function BlockButton({ profileId, username }: { profileId: string; username?: string | null }) {
  const { user, blocked, refreshBlocks } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  if (user?.id === profileId) return null;
  const isBlocked = blocked.has(profileId);

  async function toggle() {
    if (!user) return router.push("/login");
    if (!isBlocked && !confirm(`Bloquer @${username ?? "ce membre"} ? Tu ne verras plus ses graines ni ses commentaires.`)) return;
    setBusy(true);
    const { error } = isBlocked
      ? await supabase.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", profileId)
      : await supabase.from("blocks").insert({ blocker_id: user.id, blocked_id: profileId });
    if (!error && !isBlocked) {
      // Bloquer, c'est aussi ne plus suivre.
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profileId);
    }
    await refreshBlocks();
    setBusy(false);
    if (error) return toast("Action impossible pour l'instant.", "🥀");
    toast(isBlocked ? `@${username ?? "Ce membre"} est débloqué` : `@${username ?? "Ce membre"} est bloqué`, isBlocked ? "🌿" : "🚫");
  }

  return (
    <button type="button" onClick={toggle} disabled={busy} className="btn-ghost text-sm">
      {isBlocked ? "Débloquer" : "🚫 Bloquer"}
    </button>
  );
}
