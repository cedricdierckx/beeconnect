"use client";

import { useEffect } from "react";

/** Enregistre le service worker (installation PWA / appli Android, page hors-ligne). */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
