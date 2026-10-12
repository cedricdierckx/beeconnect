import { getCategory } from "@/lib/earth";

export default function CategoryChip({ id }: { id: string | null }) {
  const c = getCategory(id);
  return (
    <span className={`chip px-2.5 py-1 text-xs ${c.tone}`}>
      {c.emoji} {c.label}
    </span>
  );
}
