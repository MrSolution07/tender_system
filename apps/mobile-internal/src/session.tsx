import type { DeskRole } from "@tender/fixtures";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/src/supabase";

type Session = { id: string; role: DeskRole; name: string };

type SessionValue = {
  ready: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

function isRole(value: unknown): value is DeskRole {
  return value === "procurement_officer" || value === "evaluator" || value === "super_admin";
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  async function load() {
    if (!supabase) {
      setSession(null);
      setReady(true);
      return;
    }
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setSession(null);
      setReady(true);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || !isRole(profile.role)) {
      setSession(null);
      setReady(true);
      return;
    }
    setSession({
      id: user.id,
      role: profile.role,
      name: typeof profile.full_name === "string" ? profile.full_name : "Staff",
    });
    setReady(true);
  }

  useEffect(() => {
    void load();
    if (!supabase) return;
    const auth = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => auth.data.subscription.unsubscribe();
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      ready,
      session,
      signIn: async (email, password) => {
        if (!supabase) return "The register is not configured.";
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) return "Email or password is wrong.";
        await load();
        return null;
      },
      signOut: async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        setSession(null);
      },
    }),
    [ready, session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must sit inside SessionProvider");
  return value;
}
