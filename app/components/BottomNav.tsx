"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const me = user ? (profile?.username ? `/profile/${profile.username}` : "/profile/edit") : "/login";

  const items = [
    { href: "/feed", label: "Fil", emoji: "🌱" },
    { href: "/impact", label: "Impact", emoji: "🌻" },
    { href: me, label: user ? "Moi" : "Connexion", emoji: "🐝" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-leaf-900/5 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center">
        {items.slice(0, 2).map((i) => (
          <NavItem key={i.label} {...i} active={pathname.startsWith(i.href)} />
        ))}
        <Link
          href="/new"
          aria-label="Planter une graine"
          className="mx-auto -mt-8 grid h-16 w-16 place-items-center rounded-full bg-honey-400 text-3xl shadow-[0_4px_0_0_#D48F00] ring-4 ring-cream transition active:translate-y-0.5"
        >
          🌱
        </Link>
        <NavItem {...items[2]} active={pathname.startsWith("/profile") || pathname === "/login"} />
      </div>
    </nav>
  );
}

function NavItem({ href, label, emoji, active }: { href: string; label: string; emoji: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 text-xs font-bold ${active ? "text-leaf-700" : "text-leaf-900/50"}`}
    >
      <span className={`text-2xl transition ${active ? "scale-110" : "grayscale-[40%]"}`}>{emoji}</span>
      {label}
    </Link>
  );
}
