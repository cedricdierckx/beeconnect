"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";

/**
 * Rejoindre l'écosystème d'un membre (s'abonner). Masqué sur son propre profil
 * (contrainte follows_no_self_follow). Props : `profileId`, `onChange(following)`.
 */
export default function FollowButton({ profileId, onChange }: { profileId: string; onChange?: (following: boolean) => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return setFollowing(false);
    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profileId)
      .maybeSingle()
      .then(({ data }) => setFollowing(Boolean(data)));
  }, [user, profileId]);

  if (user?.id === profileId) return null;

  async function toggle() {
    if (!user) return router.push("/login");
    setBusy(true);
    const { error } = following
      ? await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profileId)
      : await supabase.from("follows").insert({ follower_id: user.id, following_id: profileId });
    setBusy(false);
    if (!error) {
      setFollowing(!following);
      onChange?.(!following);
    }
  }

  return (
    <button onClick={toggle} disabled={busy || following === null} className={following ? "btn-ghost" : "btn-primary"}>
      {following ? "✓ Dans mon écosystème" : "🐝 Suivre"}
    </button>
  );
}
