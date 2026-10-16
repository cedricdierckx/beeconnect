"use client";

import { useEffect, useState } from "react";
import { autoRecoverOnce, hardReload, isChunkError } from "@/lib/recover";

export default function ErrorScreen({ error, reset }: { error: Error & { digest?: string }; reset?: () => void }) {
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    console.error(error);
    if (isChunkError(error) && autoRecoverOnce()) setRecovering(true);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-6xl">🥀</p>
      <h1 className="mt-4 font-display text-2xl font-bold">
        {recovering ? "Mise à jour du jardin…" : "Oups, une fleur s'est fanée"}
      </h1>
      <p className="mt-2 text-leaf-900/70">
        {recovering
          ? "Une nouvelle version d'EarthConnect est disponible, on la charge pour toi."
          : "Un souci est survenu à l'affichage de cette page. Recharger règle le problème dans la plupart des cas."}
      </p>
      {!recovering && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => hardReload()} className="btn-honey">
            🔄 Recharger
          </button>
          {reset && (
            <button type="button" onClick={reset} className="btn-ghost">
              Réessayer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
