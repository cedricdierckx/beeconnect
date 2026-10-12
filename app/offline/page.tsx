export const metadata = { title: "Hors connexion" };

export default function OfflinePage() {
  return (
    <div className="mx-auto mt-10 max-w-md text-center">
      <div className="mx-auto grid h-24 w-24 animate-float place-items-center rounded-full bg-leaf-50 text-6xl">🐝</div>
      <h1 className="mt-4 text-3xl font-bold">Pas de réseau…</h1>
      <p className="mt-2 text-leaf-900/70">
        Même les abeilles font une pause ! Vérifie ta connexion internet, puis réessaie pour retrouver le jardin.
      </p>
      <a href="/feed" className="btn-primary mt-6">
        🔄 Réessayer
      </a>
    </div>
  );
}
