"use client";

import { useEffect, useState } from "react";

const EMOJIS = ["🌸", "🌱", "🐝", "🌼", "✨", "🌻", "🍃"];

/** Pluie d'emojis festive (après une plantation ou une floraison). */
export default function Celebration({ title, text }: { title: string; text: string }) {
  const [visible, setVisible] = useState(true);
  const [pieces] = useState(() =>
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 1.5,
      size: 18 + Math.random() * 22,
    })),
  );

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4200);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" onClick={() => setVisible(false)} role="dialog">
      <style>{`@keyframes ec-fall { from { transform: translateY(-10vh) rotate(0deg); } to { transform: translateY(110vh) rotate(360deg); } }`}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute top-0"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animation: `ec-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: "translateY(-10vh)",
          }}
        >
          {p.emoji}
        </span>
      ))}
      <div className="absolute inset-x-4 top-1/3 mx-auto max-w-sm animate-popin rounded-3xl bg-white p-6 text-center shadow-2xl">
        <p className="text-5xl">🎉</p>
        <p className="mt-2 font-display text-2xl font-bold">{title}</p>
        <p className="mt-1 text-leaf-900/70">{text}</p>
        <p className="mt-3 text-xs text-leaf-900/40">Touchez pour continuer</p>
      </div>
    </div>
  );
}
