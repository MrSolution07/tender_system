"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRand } from "@/lib/format";
import { EMPTY_CATEGORY } from "@/lib/register";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function ClosingTile({ iso }: { iso: string | null }) {
  if (!iso) {
    return (
      <span className="grid size-16 shrink-0 place-items-center rounded-[0.75rem] bg-muted px-1 text-center text-xs leading-tight text-muted-foreground">
        No closing date
      </span>
    );
  }

  const date = new Date(iso);
  const month = new Intl.DateTimeFormat("en-ZA", { month: "short" }).format(date);
  const year = date.getFullYear();
  const showYear = year !== new Date().getFullYear();

  return (
    <span
      aria-hidden="true"
      className="flex size-16 shrink-0 flex-col items-center justify-center rounded-[0.75rem] bg-secondary text-secondary-foreground"
    >
      <span className="text-xs leading-none">{month}</span>
      <span className="font-display text-2xl leading-tight font-semibold tabular-nums">
        {date.getDate()}
      </span>
      {showYear ? <span className="text-xs leading-none">{year}</span> : null}
    </span>
  );
}

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
    return [...names]
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        name,
        count: published.filter((tender) => tender.category === name).length,
      }));
  }, [published]);
  const visible =
    category === "all"
      ? published
      : published.filter((tender) => tender.category === category);

  const filters = [{ name: "all", label: "All", count: published.length }].concat(
    categories.map((item) => ({ name: item.name, label: item.name, count: item.count })),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-balance text-4xl font-semibold">
        Open notices
      </h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        Published tenders only. Drafts, bids, and contact details are not on
        this page.
      </p>

      <div
        role="group"
        aria-label="Filter by category"
        className="mt-8 flex flex-wrap gap-2"
      >
        {filters.map((filter) => {
          const active = category === filter.name;
          return (
            <button
              key={filter.name}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(filter.name)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              {filter.label}
              <span
                className={cn(
                  "tabular-nums",
                  active ? "text-primary-foreground/90" : "text-muted-foreground",
                )}
              >
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      {!ready ? (
        <Skeleton className="mt-6 h-64 w-full rounded-[1rem]" />
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-[1rem] border border-dashed border-border bg-card p-8">
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
        <>
          <p
            aria-live="polite"
            className="mt-6 text-sm tabular-nums text-muted-foreground"
          >
            {visible.length} {visible.length === 1 ? "notice" : "notices"}
            {category === "all" ? "" : ` in ${category}`}
          </p>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-[1rem] border border-border bg-card">
            {visible.map((tender) => (
              <li key={tender.id}>
                <Link
                  href={`/tenders/${tender.id}`}
                  className="group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 px-4 py-4 outline-none transition-colors hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-6 md:px-6"
                >
                  <ClosingTile iso={tender.closingAt} />
                  <span className="min-w-0">
                    {tender.closingAt ? (
                      <span className="sr-only">
                        Closes {formatDate(tender.closingAt)}.{" "}
                      </span>
                    ) : null}
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium underline-offset-4 group-hover:underline">
                        {tender.title}
                      </span>
                      <StatusBadge status={tender.status} />
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {tender.department} · {tender.category}
                    </span>
                  </span>
                  <span className="col-start-2 md:col-start-auto md:text-right">
                    <span className="block font-display text-xl font-semibold tabular-nums">
                      {formatRand(tender.budgetCents)}
                    </span>
                    <span className="block text-sm text-muted-foreground">Budget</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
