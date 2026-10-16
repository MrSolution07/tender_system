"use client";

import { TENDER_STATUSES, type TenderStatus } from "@tender/shared";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { TENDER_STATUS_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store";

export default function DeskTendersPage() {
  const { tenders, session } = useStore();
  const [status, setStatus] = useState<TenderStatus | "all">("all");
  const visible = useMemo(
    () =>
      status === "all" ? tenders : tenders.filter((tender) => tender.status === status),
    [status, tenders],
  );
  const canCreate =
    session?.role === "procurement_officer" || session?.role === "super_admin";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-balance text-4xl font-semibold">Tenders</h1>
        {canCreate ? (
          <Button asChild className="h-11">
            <Link href="/desk/tenders/new">New tender</Link>
          </Button>
        ) : null}
      </div>
      <div className="mt-6 max-w-xs">
        <label htmlFor="status" className="mb-2 block text-sm font-medium">
          Status
        </label>
        <Select
          value={status}
          onValueChange={(value) => {
            if (value === "all" || TENDER_STATUSES.includes(value as TenderStatus)) {
              setStatus((value ?? "all") as TenderStatus | "all");
            }
          }}
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TENDER_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {TENDER_STATUS_LABEL[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {visible.length === 0 ? (
        <div className="mt-8 border-y border-border py-8">
          <p className="text-muted-foreground">No tenders with that status.</p>
          <Button variant="outline" className="mt-4 h-11" onClick={() => setStatus("all")}>
            Show every status
          </Button>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {visible.map((tender) => (
            <li key={tender.id}>
              <Link
                href={`/desk/tenders/${tender.id}`}
                className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between"
              >
                <span>
                  <span className="font-medium">{tender.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {tender.department}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <StatusBadge status={tender.status} />
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {tender.closingAt ? formatDate(tender.closingAt) : "No date"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
