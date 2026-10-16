import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/src/supabase";

type Session = { id: string; name: string; company: string };

type SessionValue = {
  ready: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

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
    const [{ data: profile }, { data: contractor }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase.from("contractors").select("company_name").eq("profile_id", user.id).maybeSingle(),
    ]);
    setSession({
      id: user.id,
      name: typeof profile?.full_name === "string" ? profile.full_name : "Contractor",
      company: typeof contractor?.company_name === "string" ? contractor.company_name : "",
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
