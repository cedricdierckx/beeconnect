const RELOAD_FLAG = "ec-recovered-at";

/** Erreur typique d'un fichier JavaScript introuvable après un nouveau déploiement. */
export function isChunkError(error: Error) {
  return /ChunkLoadError|Loading chunk|Loading CSS chunk|Failed to fetch dynamically imported module/i.test(
    `${error.name} ${error.message}`,
  );
}

/** Vide les caches du service worker puis recharge la page. */
export async function hardReload() {
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    const reg = await navigator.serviceWorker?.getRegistration();
    await reg?.update();
  } catch {}
  window.location.reload();
}

/** Recharge automatiquement une seule fois par minute, pour ne jamais boucler. */
export function autoRecoverOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  } catch {
    return false;
  }
  hardReload();
  return true;
}
