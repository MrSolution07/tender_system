import { CONTRACTOR_PREVIEW } from "@tender/fixtures";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Session = { name: string; company: string };

type SessionValue = {
  session: Session | null;
  enter: () => void;
  leave: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const value = useMemo<SessionValue>(
    () => ({
      session,
      enter: () =>
        setSession({
          name: CONTRACTOR_PREVIEW.name,
          company: CONTRACTOR_PREVIEW.company,
        }),
      leave: () => setSession(null),
    }),
    [session],
  );
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must sit inside SessionProvider");
  }
  return value;
}
