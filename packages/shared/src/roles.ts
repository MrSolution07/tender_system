export const APP_ROLES = [
  "super_admin",
  "procurement_officer",
  "evaluator",
  "contractor",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const CLIENTS = {
  internal: ["super_admin", "procurement_officer", "evaluator"],
  external: ["contractor"],
  public: [],
} as const satisfies Record<string, readonly AppRole[]>;

export function isInternalRole(role: AppRole): boolean {
  return (CLIENTS.internal as readonly AppRole[]).includes(role);
}

export function isExternalRole(role: AppRole): boolean {
  return (CLIENTS.external as readonly AppRole[]).includes(role);
}
