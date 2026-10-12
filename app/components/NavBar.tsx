"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Avatar from "./Avatar";
import { useAuth } from "./AuthProvider";

const LINKS = [
  { href: "/feed", label: "Le fil", emoji: "🌱" },
  { href: "/impact", label: "Impact", emoji: "🌻" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-leaf-900/5 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`chip px-4 py-2 font-display ${
                  active ? "bg-leaf-100 text-leaf-800" : "text-leaf-800/70 hover:bg-white"
                }`}
              >
                <span>{l.emoji}</span> {l.label}
              </Link>
            );
          })}
          <Link href="/new" className="btn-honey ml-2 py-2">
            🌱 Planter une graine
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="h-10 w-10 animate-pulse rounded-full bg-leaf-100" />
          ) : user ? (
            <Link
              href={profile?.username ? `/profile/${profile.username}` : "/profile/edit"}
              className="flex items-center gap-2 rounded-full p-1 pr-3 transition hover:bg-white"
            >
              <Avatar url={profile?.avatar_url} name={profile?.username ?? user.email} size={36} />
              <span className="hidden font-display text-sm font-semibold md:inline">
                {profile?.username ?? "Mon profil"}
              </span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden font-display font-semibold text-leaf-700 hover:underline sm:inline">
                Connexion
              </Link>
              <Link href="/signup" className="btn-primary py-2 text-sm">
                Rejoindre
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
