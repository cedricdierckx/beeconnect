/* eslint-disable @next/next/no-img-element */

const COLORS = ["bg-leaf-300", "bg-honey-300", "bg-petal-300", "bg-sky-300", "bg-teal-300", "bg-orange-300"];

type Props = {
  url?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
};

export default function Avatar({ url, name, size = 40, className = "" }: Props) {
  const label = (name || "?").trim();
  const color = COLORS[(label.charCodeAt(0) || 0) % COLORS.length];
  const style = { width: size, height: size, fontSize: size * 0.42 };
  if (url) {
    return (
      <img
        src={url}
        alt={label}
        style={style}
        className={`shrink-0 rounded-full object-cover ring-2 ring-white ${className}`}
      />
    );
  }
  return (
    <span
      style={style}
      className={`grid shrink-0 place-items-center rounded-full font-display font-bold uppercase text-leaf-900 ring-2 ring-white ${color} ${className}`}
      aria-label={label}
    >
      {label.charAt(0)}
    </span>
  );
}
