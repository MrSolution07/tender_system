import { APP_ROLES, type AppRole } from "@tender/shared";

import { createSupabase, hasSupabaseConfig } from "./supabase";

export type Person = {
  id: string;
  email: string;
  fullName: string;
  department: string;
  role: AppRole;
  companyName: string;
  registrationNumber: string;
  disabled: boolean;
};

export type AuditRow = {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
  role: string;
};

type AdminResult = { error: string | null; people: Person[] };

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
      department: typeof row.department === "string" ? row.department : "",
      role: row.role,
      companyName: typeof row.companyName === "string" ? row.companyName : "",
      registrationNumber: typeof row.registrationNumber === "string" ? row.registrationNumber : "",
      disabled: row.disabled === true,
    }];
  });
}

async function invoke(body: Record<string, unknown>): Promise<AdminResult> {
  if (!hasSupabaseConfig()) return { error: "The register is not configured.", people: [] };
  const supabase = createSupabase();
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

export function listPeople(): Promise<AdminResult> {
  return invoke({ action: "list" });
}

export function invitePerson(input: {
  email: string;
  password: string;
  fullName: string;
  department: string;
  role: AppRole;
  companyName: string;
  registrationNumber: string;
}): Promise<AdminResult> {
  return invoke({ action: "invite", ...input });
}

export function changePersonRole(input: {
  userId: string;
  role: AppRole;
  companyName: string;
  registrationNumber: string;
}): Promise<AdminResult> {
  return invoke({ action: "role_change", ...input });
}

export function setPersonAccess(userId: string, disabled: boolean): Promise<AdminResult> {
  return invoke({ action: "set_access", userId, disabled });
}

export async function loadAudit(): Promise<{ rows: AuditRow[]; error: string | null }> {
  if (!hasSupabaseConfig()) return { rows: [], error: "The register is not configured." };
  const supabase = createSupabase();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, metadata, created_at, profiles(full_name)")
    .eq("entity", "profiles")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { rows: [], error: "The audit log could not be loaded." };
  const rows = (data ?? []).flatMap((item): AuditRow[] => {
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "number" && typeof row.id !== "string") return [];
    const actor = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const actorName =
      actor && typeof actor === "object" && typeof (actor as { full_name?: unknown }).full_name === "string"
        ? (actor as { full_name: string }).full_name
        : "Staff";
    const metadata = row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, unknown>) : {};
    return [{
      id: String(row.id),
      action: typeof row.action === "string" ? row.action : "",
      actor: actorName,
      createdAt: typeof row.created_at === "string" ? row.created_at : "",
      role: typeof metadata.role === "string" ? metadata.role : "",
    }];
  });
  return { rows, error: null };
}
