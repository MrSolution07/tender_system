"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRand } from "@/lib/format";
import { EMPTY_CATEGORY } from "@/lib/sample-data";
import { useStore } from "@/lib/store";

export default function TendersPage() {
  const { ready, tenders } = useStore();
  const [category, setCategory] = useState("all");

  const published = useMemo(
    () => tenders.filter((tender) => tender.status === "published"),
    [tenders],
  );
  const categories = useMemo(() => {
    const names = new Set(published.map((tender) => tender.category));
    names.add(EMPTY_CATEGORY);
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [published]);
  const visible =
    category === "all"
      ? published
      : published.filter((tender) => tender.category === category);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-balance text-4xl font-semibold">
        Open notices
      </h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        Published tenders only. Drafts, bids, and contact details are not on
        this page.
      </p>

      <div className="mt-8 max-w-xs">
        <label htmlFor="category" className="mb-2 block text-sm font-medium">
          Category
        </label>
        <Select value={category} onValueChange={(value) => setCategory(value ?? "all")}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!ready ? (
        <Skeleton className="mt-8 h-40 w-full" />
      ) : visible.length === 0 ? (
        <div className="mt-10 border-y border-border py-10">
          <p className="text-pretty text-muted-foreground">
            No open notices in {category}.
          </p>
          <Button
            variant="outline"
            className="mt-4 h-11"
            onClick={() => setCategory("all")}
          >
            Show all categories
          </Button>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {visible.map((tender) => (
            <li key={tender.id}>
              <Link
                href={`/tenders/${tender.id}`}
                className="grid gap-2 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline md:gap-8"
              >
                <span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{tender.title}</span>
                    <StatusBadge status={tender.status} />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {tender.department} · {tender.category}
                  </span>
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {tender.closingAt ? `Closes ${formatDate(tender.closingAt)}` : "No closing date"}
                  <span className="mt-1 block md:text-right">
                    {formatRand(tender.budgetCents)}
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
