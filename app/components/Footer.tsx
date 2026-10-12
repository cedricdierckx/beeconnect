import Link from "next/link";
import { LEGAL_PAGES } from "@/lib/legal";

export default function Footer() {
  return (
    <footer className="hidden border-t border-leaf-900/5 py-8 text-center text-sm text-leaf-800/60 sm:block">
      <p className="font-display">
        🌍 EarthConnect — Une action commence quelque part. EarthConnect l&apos;aide à fleurir partout. 🌸
      </p>
      <nav className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1">
        {LEGAL_PAGES.map((p) => (
          <Link key={p.href} href={p.href} className="hover:text-leaf-800 hover:underline">
            {p.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
