"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; text: string; emoji?: string };

const ToastContext = createContext<(text: string, emoji?: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, emoji?: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, emoji }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-8">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="flex animate-popin items-center gap-2 rounded-full bg-leaf-800 px-5 py-3 font-display font-semibold text-white shadow-soft"
          >
            {t.emoji && <span className="text-xl">{t.emoji}</span>}
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
