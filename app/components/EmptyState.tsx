import Link from "next/link";
import { SEED_IDEAS } from "@/lib/earth";

export default function EmptyState({
  emoji = "🌱",
  title,
  text,
  ideas = false,
  children,
}: {
  emoji?: string;
  title: string;
  text?: string;
  ideas?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="card px-6 py-10 text-center">
      <div className="mx-auto mb-3 grid h-20 w-20 animate-float place-items-center rounded-full bg-leaf-50 text-5xl">
        {emoji}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      {text && <p className="mx-auto mt-1 max-w-md text-leaf-900/60">{text}</p>}
      {ideas && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {SEED_IDEAS.map((i) => (
            <Link
              key={i.text}
              href={`/new?idea=${encodeURIComponent(i.text)}`}
              className="chip bg-honey-50 text-leaf-800 ring-1 ring-honey-200 hover:bg-honey-100"
            >
              {i.emoji} {i.text}
            </Link>
          ))}
        </div>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
