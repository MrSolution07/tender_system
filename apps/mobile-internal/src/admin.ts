import { APP_ROLES, type AppRole } from "@tender/shared";

import { supabase } from "@/src/supabase";

export type Person = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  companyName: string;
  disabled: boolean;
};

function isRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
}

function peopleFrom(value: unknown): Person[] {
  if (!value || typeof value !== "object" || !("people" in value)) return [];
  const rows = (value as { people?: unknown }).people;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((item): Person[] => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string" || !isRole(row.role)) return [];
    return [{
      id: row.id,
      email: typeof row.email === "string" ? row.email : "",
      fullName: typeof row.fullName === "string" ? row.fullName : "",
      role: row.role,
      companyName: typeof row.companyName === "string" ? row.companyName : "",
      disabled: row.disabled === true,
    }];
  });
}

export async function callAdmin(body: Record<string, unknown>): Promise<{ error: string | null; people: Person[] }> {
  if (!supabase) return { error: "The register is not configured.", people: [] };
  const { data, error } = await supabase.functions.invoke("admin-users", { body });
  if (error) {
    const context = "context" in error ? (error as { context?: unknown }).context : undefined;
    if (context instanceof Response) {
      try {
        const payload: unknown = await context.json();
        if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
          return { error: payload.error, people: [] };
        }
      } catch {
        // The function did not return JSON.
      }
    }
    return { error: "The people service is unavailable.", people: [] };
  }
  if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
    return { error: data.error, people: [] };
  }
  return { error: null, people: peopleFrom(data) };
}
