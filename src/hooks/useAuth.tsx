import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { createUser } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ensuredUsers = new Set<string>();
function ensureBackendUser(u: User | null) {
  if (!u || ensuredUsers.has(u.id)) return;
  ensuredUsers.add(u.id);
  const displayName =
    (u.user_metadata?.display_name as string | undefined) ??
    (u.user_metadata?.full_name as string | undefined) ??
    u.email ??
    null;
  void createUser({ user_id: u.id, display_name: displayName });
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
          ensureBackendUser(session.user);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) ensureBackendUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear per-user local caches so the next account on this device
    // doesn't briefly see the previous user's data. Cloud rows are kept
    // so the data returns when this user logs back in.
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('cloudrow:')) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {}
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};