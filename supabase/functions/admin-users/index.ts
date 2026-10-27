import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const ROLES = ["super_admin", "procurement_officer", "evaluator", "contractor"] as const;
type AppRole = (typeof ROLES)[number];

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function respond(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function isRole(value: unknown): value is AppRole {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: jsonHeaders });
  if (req.method !== "POST") return respond(405, { error: "Use POST." });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) {
    return respond(200, { error: "The people service is not configured." });
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization) return respond(401, { error: "Sign in again." });

  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await caller.auth.getUser();
  if (userError || !userData.user) return respond(401, { error: "Sign in again." });

  const { data: callerProfile } = await caller
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (callerProfile?.role !== "super_admin") {
    return respond(403, { error: "This desk is for a super admin." });
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let body: Record<string, unknown>;
  try {
    body = record(await req.json());
  } catch {
    return respond(200, { error: "The request could not be read." });
  }

  const action = text(body.action);
  if (action === "list") return listPeople(admin);
  if (action === "invite") return invitePerson(admin, userData.user.id, body);
  if (action === "role_change") return changeRole(admin, userData.user.id, body);
  if (action === "set_access") return setAccess(admin, userData.user.id, body);
  return respond(200, { error: "That action is not available." });
});

async function listPeople(admin: SupabaseClient): Promise<Response> {
  const users = [];
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return respond(200, { error: "Could not list accounts." });
    users.push(...data.users);
    if (data.users.length < 200) break;
  }

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id, role, full_name, department");
  if (profileError) return respond(200, { error: "Could not list profiles." });

  const { data: companies, error: companyError } = await admin
    .from("contractors")
    .select("profile_id, company_name, registration_number");
  if (companyError) return respond(200, { error: "Could not list companies." });

  const profileById = new Map(
    (profiles ?? []).map((row) => [row.id as string, row]),
  );
  const companyByProfile = new Map(
    (companies ?? []).map((row) => [row.profile_id as string, row]),
  );

  const people = users.flatMap((user) => {
    const profile = profileById.get(user.id);
    const role = profile?.role;
    if (!isRole(role)) return [];
    const company = companyByProfile.get(user.id);
    const bannedUntil = user.banned_until ? Date.parse(user.banned_until) : Number.NaN;
    return [{
      id: user.id,
      email: user.email ?? "",
      fullName: typeof profile.full_name === "string" ? profile.full_name : "",
      department: typeof profile.department === "string" ? profile.department : "",
      role,
      companyName: typeof company?.company_name === "string" ? company.company_name : "",
      registrationNumber:
        typeof company?.registration_number === "string" ? company.registration_number : "",
      disabled: Number.isFinite(bannedUntil) && bannedUntil > Date.now(),
    }];
  });
  people.sort((a, b) => a.fullName.localeCompare(b.fullName));
  return respond(200, { people });
}

async function invitePerson(
  admin: SupabaseClient,
  actorId: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const email = text(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const fullName = text(body.fullName);
  const department = text(body.department);
  const role = body.role;
  const companyName = text(body.companyName);
  const registrationNumber = text(body.registrationNumber);

  if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
    return respond(200, { error: "Enter a valid email address." });
  }
  if (password.length < 6) return respond(200, { error: "Password must be at least 6 characters." });
  if (!fullName) return respond(200, { error: "Enter the person's name." });
  if (!isRole(role)) return respond(200, { error: "Choose a role from the register." });
  if (role === "contractor" && !companyName) {
    return respond(200, { error: "A contractor needs a company name." });
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: { full_name: fullName, department },
  });
  if (error || !data.user) {
    const detail = error?.message ?? "";
    if (/already|registered|exists/i.test(detail)) {
      return respond(200, { error: "An account with that email already exists." });
    }
    if (/password/i.test(detail)) return respond(200, { error: detail });
    return respond(200, { error: "Could not create the account." });
  }

  const userId = data.user.id;
  const { data: profile } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!profile) {
    await admin.auth.admin.deleteUser(userId);
    return respond(200, { error: "The account had no role profile, so it was removed." });
  }

  if (role === "contractor") {
    const { error: companyError } = await admin.from("contractors").insert({
      profile_id: userId,
      company_name: companyName,
      registration_number: registrationNumber || null,
    });
    if (companyError) {
      await admin.auth.admin.deleteUser(userId);
      return respond(200, { error: "Could not save the company, so the account was removed." });
    }
  }

  await writeAudit(admin, actorId, userId, "invite", { role });
  return respond(200, { ok: true });
}

async function changeRole(
  admin: SupabaseClient,
  actorId: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const userId = text(body.userId);
  const role = body.role;
  const companyName = text(body.companyName);
  const registrationNumber = text(body.registrationNumber);
  if (!userId || !isRole(role)) return respond(200, { error: "Choose a person and a role." });
  if (userId === actorId) return respond(200, { error: "You cannot change your own role here." });

  const { data: target } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (!target || !isRole(target.role)) return respond(200, { error: "That person is not on the register." });
  if (target.role === role) return respond(200, { error: "That person already has this role." });

  const blocked = await lastSuperAdminBlock(admin, target.role, role !== "super_admin");
  if (blocked) return respond(200, { error: blocked });

  const { data: company } = await admin
    .from("contractors")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();
  if (role === "contractor" && !company && !companyName) {
    return respond(200, { error: "A contractor needs a company name." });
  }
  if (role === "contractor" && !company) {
    const { error } = await admin.from("contractors").insert({
      profile_id: userId,
      company_name: companyName,
      registration_number: registrationNumber || null,
    });
    if (error) return respond(200, { error: "Could not save the company." });
  }

  const { error: profileError } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (profileError) return respond(200, { error: "Could not change the role." });

  const { data: authUser, error: readError } = await admin.auth.admin.getUserById(userId);
  if (readError || !authUser.user) {
    await admin.from("profiles").update({ role: target.role }).eq("id", userId);
    return respond(200, { error: "Could not change the role." });
  }
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { ...authUser.user.app_metadata, role },
  });
  if (authError) {
    await admin.from("profiles").update({ role: target.role }).eq("id", userId);
    return respond(200, { error: "Could not change the role." });
  }

  await writeAudit(admin, actorId, userId, "role_change", { role, from: target.role });
  return respond(200, { ok: true });
}

async function setAccess(
  admin: SupabaseClient,
  actorId: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const userId = text(body.userId);
  const disabled = body.disabled === true;
  if (!userId) return respond(200, { error: "Choose a person." });
  if (userId === actorId) return respond(200, { error: "You cannot change your own account here." });

  const { data: target } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (!target || !isRole(target.role)) return respond(200, { error: "That person is not on the register." });
  if (disabled) {
    const blocked = await lastSuperAdminBlock(admin, target.role, true);
    if (blocked) return respond(200, { error: blocked });
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: disabled ? "876000h" : "none",
  });
  if (error) return respond(200, { error: disabled ? "Could not disable the account." : "Could not enable the account." });

  await writeAudit(admin, actorId, userId, disabled ? "disable" : "enable", { role: target.role });
  return respond(200, { ok: true });
}

async function lastSuperAdminBlock(
  admin: SupabaseClient,
  current: AppRole,
  leaving: boolean,
): Promise<string | null> {
  if (current !== "super_admin" || !leaving) return null;
  const { count, error } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin");
  if (error) return "Could not check the remaining super admins.";
  if ((count ?? 0) <= 1) return "Keep at least one super admin.";
  return null;
}

async function writeAudit(
  admin: SupabaseClient,
  actorId: string,
  entityId: string,
  action: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  await admin.from("audit_logs").insert({
    actor_id: actorId,
    entity: "profiles",
    entity_id: entityId,
    action,
    metadata,
  });
}
