"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { loadAudit, type AuditRow } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

const ACTION_LABEL: Record<string, string> = {
  invite: "Invited",
  role_change: "Changed role",
  disable: "Disabled",
  enable: "Enabled",
};

export default function AuditPage() {
  const { session } = useStore();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session?.role !== "super_admin") return;
    void loadAudit().then((result) => {
      setRows(result.rows);
      setMessage(result.error);
    });
  }, [session?.role]);

  if (session?.role !== "super_admin") {
    return (
      <div>
        <h1 className="font-display text-4xl font-semibold">Audit</h1>
        <p className="mt-3 text-muted-foreground">This desk is for a super admin.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-balance text-4xl font-semibold">Audit</h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        Account changes made from this desk. Passwords are not recorded.
      </p>
      {message ? (
        <Alert className="mt-4">
          <AlertTitle>Audit</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {rows.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No account changes yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {rows.map((row) => (
            <li key={row.id} className="py-3 text-sm">
              <p className="font-medium">
                {ACTION_LABEL[row.action] ?? row.action}
                {row.role ? ` · ${row.role}` : ""}
              </p>
              <p className="text-muted-foreground">
                {row.actor}
                {row.createdAt ? ` · ${formatDate(row.createdAt)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
