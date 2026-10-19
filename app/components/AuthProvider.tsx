"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

type AuthState = {
  user: User | null;
  profile: Tables<"profiles"> | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  /** Membres bloqués par l'utilisateur courant : leurs contenus sont masqués. */
  blocked: Set<string>;
  refreshBlocks: () => Promise<void>;
  /** Vrai si l'utilisateur figure dans la table `admins` (espace administrateurs). */
  isAdmin: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  blocked: new Set(),
  refreshBlocks: async () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);

  const loadAdmin = useCallback(async (u: User | null) => {
    if (!u) return setIsAdmin(false);
    // La politique RLS ne renvoie que sa propre ligne (ou toutes pour un administrateur).
    const { data } = await supabase.from("admins").select("user_id").eq("user_id", u.id).maybeSingle();
    setIsAdmin(Boolean(data));
  }, []);

  const loadBlocks = useCallback(async (u: User | null) => {
    if (!u) return setBlocked(new Set());
    const { data } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", u.id);
    setBlocked(new Set((data ?? []).map((b) => b.blocked_id)));
  }, []);

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
    setProfile(data);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const u = data.session?.user ?? null;
      setUser(u);
      await Promise.all([loadProfile(u), loadBlocks(u), loadAdmin(u)]);
      if (active) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      // Différé pour éviter un appel Supabase à l'intérieur du rappel d'authentification.
      setTimeout(() => {
        loadProfile(u);
        loadBlocks(u);
        loadAdmin(u);
      }, 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile, loadBlocks, loadAdmin]);

  const refreshProfile = useCallback(() => loadProfile(user), [loadProfile, user]);
  const refreshBlocks = useCallback(() => loadBlocks(user), [loadBlocks, user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, blocked, refreshBlocks, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
