"use client";

import { APP_ROLES, type AppRole } from "@tender/shared";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store";
import { createSupabase, hasSupabaseConfig } from "@/lib/supabase";

type AccountRow = {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  department: string | null;
};

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  company?: string;
};

function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
}

function isAccount(value: unknown): value is AccountRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.email === "string" &&
    typeof row.full_name === "string" &&
    isAppRole(row.role) &&
    (row.department === null || typeof row.department === "string")
  );
}

export default function UsersPage() {
  const { session } = useStore();
  const supabase = useMemo(
    () => (hasSupabaseConfig() ? createSupabase() : null),
    [],
  );
  const allowed = session?.role === "super_admin";
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("procurement_officer");
  const [department, setDepartment] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!supabase || !allowed) return;
    const { data, error } = await supabase.rpc("list_accounts");
    if (error) {
      setLoadError(error.message);
      return;
    }
    const rows = Array.isArray(data) ? data.filter(isAccount) : [];
    setAccounts(rows);
    setLoadError(null);
  }, [supabase, allowed]);

  useEffect(() => {
    void load();
  }, [load]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(null);
    setSaved(null);
    const next: FieldErrors = {};
    if (name.trim().length < 2) next.name = "Enter the full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email.";
    }
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (role === "contractor" && company.trim().length < 2) {
      next.company = "Enter the company name.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (!supabase || !allowed) {
      setSaveError("Only a super admin can create an account.");
      return;
    }

    setSaving(true);
    void (async () => {
      const { error } = await supabase.rpc("create_account", {
        p_email: email.trim(),
        p_password: password,
        p_full_name: name.trim(),
        p_role: role,
        p_department: role === "contractor" ? null : department.trim() || null,
        p_company: role === "contractor" ? company.trim() : null,
      });
      if (error) {
        setSaveError(error.message);
        setSaving(false);
        return;
      }
      setPassword("");
      setSaved(`${email.trim().toLowerCase()} can sign in with that password.`);
      await load();
      setSaving(false);
    })();
  }

  return (
    <div>
      <h1 className="font-display text-balance text-4xl font-semibold">Users</h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        Create a sign-in. The role is stored with the account, then copied onto
        the profile.
      </p>
      {!allowed ? (
        <Alert className="mt-6">
          <AlertTitle>Super admin only</AlertTitle>
          <AlertDescription>This page creates accounts and sets roles.</AlertDescription>
        </Alert>
      ) : null}
      {!hasSupabaseConfig() ? (
        <Alert className="mt-6">
          <AlertTitle>Register is not configured</AlertTitle>
          <AlertDescription>Add the Supabase URL and publishable key.</AlertDescription>
        </Alert>
      ) : null}
      <form className="mt-8 grid max-w-xl gap-5" onSubmit={onSubmit} noValidate>
        <Field id="name" label="Full name" value={name} onChange={setName} error={errors.name} />
        <Field
          id="email"
          label="Email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          type="email"
        />
        <Field
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          type="password"
        />
        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
            <SelectTrigger id="role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP_ROLES.map((item) => (
                <SelectItem key={item} value={item}>
                  {ROLE_LABEL[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {role === "contractor" ? (
          <Field
            id="company"
            label="Company"
            value={company}
            onChange={setCompany}
            error={errors.company}
          />
        ) : (
          <Field
            id="department"
            label="Department"
            value={department}
            onChange={setDepartment}
          />
        )}
        {saveError ? (
          <Alert>
            <AlertTitle>Not created</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        ) : null}
        {saved ? (
          <Alert>
            <AlertTitle>Account created</AlertTitle>
            <AlertDescription>{saved}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" className="h-11 w-fit" disabled={saving || !allowed}>
          {saving ? "Creating…" : "Create account"}
        </Button>
      </form>
      <h2 className="mt-12 font-display text-2xl font-semibold">On the register</h2>
      {loadError ? (
        <p className="mt-3 text-sm text-destructive">{loadError}</p>
      ) : null}
      <ul className="mt-4 grid gap-3">
        {accounts.map((account) => (
          <li key={account.id} className="border-y border-border py-4">
            <p className="font-medium">{account.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {account.email} · {ROLE_LABEL[account.role]}
              {account.department ? ` · ${account.department}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "email" | "password";
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={type === "password" ? "new-password" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
