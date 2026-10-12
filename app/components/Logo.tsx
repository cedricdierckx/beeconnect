import Link from "next/link";

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <Link href="/" className="group inline-flex items-center gap-2" aria-label="EarthConnect — accueil">
      <span
        className={`relative grid place-items-center rounded-full bg-gradient-to-br from-leaf-300 to-leaf-600 shadow-soft ${
          big ? "h-14 w-14 text-3xl" : "h-10 w-10 text-xl"
        }`}
      >
        🌍
        <span className="absolute -right-2 -top-2 text-base group-hover:animate-wiggle">🐝</span>
      </span>
      <span className={`font-display font-bold tracking-tight text-leaf-800 ${big ? "text-3xl" : "text-xl"}`}>
        Earth<span className="text-honey-500">Connect</span>
      </span>
    </Link>
  );
}
