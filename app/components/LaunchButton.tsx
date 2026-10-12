"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toaster";

/**
 * « Je me lance » : l'utilisateur déclare son intention de reproduire une graine.
 * Une fois lancé, le bouton invite à publier la floraison (`/new?bloom=<postId>`).
 * Props : `postId`, `authorId` (masqué sur ses propres graines), `launched` (undefined = pas
 * lancé, null = lancé sans floraison, string = id de la floraison publiée).
 */
export default function LaunchButton({
  postId,
  authorId,
  launched,
  big = false,
  onChange,
}: {
  postId: string;
  authorId: string;
  launched: string | null | undefined;
  big?: boolean;
  onChange?: (launched: string | null | undefined) => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [state, setState] = useState(launched);
  const [busy, setBusy] = useState(false);

  useEffect(() => setState(launched), [launched]);

  if (user?.id === authorId) return null;

  const size = big ? "px-6 py-3 text-lg" : "px-4 py-2 text-sm";

  if (typeof state === "string") {
    return (
      <Link href={`/seed/${state}`} className={`chip bg-petal-100 font-display text-petal-500 ${size}`}>
        🌸 Fleuri chez moi
      </Link>
    );
  }

  async function launch() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("intentions")
      .upsert({ post_id: postId, user_id: user.id }, { onConflict: "post_id,user_id", ignoreDuplicates: true });
    setBusy(false);
    if (error) return toast("Impossible de se lancer pour l'instant.", "🥀");
    setState(null);
    onChange?.(null);
    toast("Bravo ! La graine germe chez toi", "🌱");
  }

  async function cancel() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("intentions").delete().eq("post_id", postId).eq("user_id", user.id);
    setBusy(false);
    if (error) return;
    setState(undefined);
    onChange?.(undefined);
  }

  if (state === null) {
    return (
      <span className="inline-flex items-center gap-1">
        <Link
          href={`/new?bloom=${postId}`}
          className={`inline-flex items-center gap-2 rounded-full bg-petal-400 font-display font-semibold text-white shadow-[0_3px_0_0_#C93A6B] transition hover:bg-petal-500 active:translate-y-0.5 ${size}`}
        >
          🌸 J&apos;ai réalisé !
        </Link>
        <button
          onClick={cancel}
          disabled={busy}
          title="Annuler mon intention"
          className="grid h-8 w-8 place-items-center rounded-full text-leaf-900/40 hover:bg-leaf-50 hover:text-leaf-900"
        >
          ×
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={launch}
      disabled={busy}
      title="Je veux reproduire cette action chez moi"
      className={`inline-flex items-center gap-2 rounded-full bg-leaf-50 font-display font-semibold text-leaf-700 ring-2 ring-leaf-200 transition hover:bg-leaf-100 active:scale-95 ${size}`}
    >
      🌱 Je me lance
    </button>
  );
}
