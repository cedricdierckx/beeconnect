import Link from "next/link";
import { LEGAL, LEGAL_PAGES, hasPlaceholders } from "@/lib/legal";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl">
      <nav className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {LEGAL_PAGES.map((p) => (
          <Link key={p.href} href={p.href} className="chip shrink-0 bg-white text-leaf-800 ring-1 ring-leaf-900/10 hover:bg-leaf-50">
            {p.emoji} {p.label}
          </Link>
        ))}
      </nav>
      {hasPlaceholders() && (
        <p className="mb-5 rounded-2xl bg-honey-50 px-4 py-3 text-sm text-leaf-800 ring-1 ring-honey-200">
          🚧 Document en cours de finalisation : certaines informations sur l&apos;éditeur restent à compléter.
        </p>
      )}
      <article className="card legal p-6 sm:p-10">{children}</article>
      <p className="mt-4 text-center text-xs text-leaf-900/50">
        {LEGAL.appName} · Dernière mise à jour : {LEGAL.lastUpdated}
      </p>
    </div>
  );
}
