import Link from "next/link";
import { LEGAL_PAGES } from "@/lib/legal";

export const metadata = { title: "Informations légales" };

export default function LegalIndexPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">⚖️ Informations légales</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {LEGAL_PAGES.map((p) => (
          <Link key={p.href} href={p.href} className="rounded-2xl bg-leaf-50 p-5 no-underline transition hover:bg-leaf-100">
            <span className="text-3xl">{p.emoji}</span>
            <span className="mt-2 block font-display text-lg font-semibold text-leaf-800">{p.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
