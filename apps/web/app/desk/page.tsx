"use client";

import { TENDER_STATUSES } from "@tender/shared";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PipelineChart } from "@/components/pipeline-chart";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const DAY = 24 * 60 * 60 * 1000;

const surface = "rounded-[1rem] border border-border bg-card shadow-card";

function daysLabel(deltaMs: number): string {
  const days = Math.ceil(deltaMs / DAY);
  if (days <= 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div className={cn(surface, "p-5")}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[0.5rem] bg-secondary text-primary">
          <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p
        className={cn(
          "mt-4 font-display text-5xl leading-none font-semibold",
          accent ? "text-highlight" : "text-primary-deep",
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  count,
  children,
  footer,
}: {
  icon: LucideIcon;
  title: string;
  count: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className={cn(surface, "flex flex-col")}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold">
          <Icon className="size-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
          {title}
        </h2>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold text-secondary-foreground tabular-nums">
          {count}
        </span>
      </div>
      <div className="flex-1">{children}</div>
      {footer ? <div className="border-t border-border p-4">{footer}</div> : null}
    </section>
  );
}

function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <p className="max-w-[32ch] text-pretty text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function DateTile({ iso }: { iso: string }) {
  const date = new Date(iso);
  const month = new Intl.DateTimeFormat("en-ZA", { month: "short" }).format(date);
  return (
    <span
      aria-hidden="true"
      className="flex size-14 shrink-0 flex-col items-center justify-center rounded-[0.75rem] bg-secondary text-secondary-foreground"
    >
      <span className="text-xs leading-none">{month}</span>
      <span className="font-display text-xl leading-tight font-semibold tabular-nums">
        {date.getDate()}
      </span>
    </span>
  );
}

export default function PipelinePage() {
  const { tenders, evaluations, session } = useStore();
  // Read the clock once, when the page mounts, so render stays pure.
  const [now] = useState(() => Date.now());

  const counts = TENDER_STATUSES.map((status) => ({
    status,
    count: tenders.filter((tender) => tender.status === status).length,
  }));
  const openCount = tenders.filter((tender) => tender.status === "published").length;

  const closingSoon = tenders
    .filter((tender) => {
      if (tender.status !== "published" || !tender.closingAt) return false;
      const delta = new Date(tender.closingAt).getTime() - now;
      return delta >= 0 && delta <= 7 * DAY;
    })
    .sort(
      (a, b) =>
        new Date(a.closingAt ?? 0).getTime() - new Date(b.closingAt ?? 0).getTime(),
    );
  const unscored = evaluations.filter((item) => item.score === null);

  const givenName = session
    ? (session.name.split(" ")[0] ?? session.name)
    : "there";
  const canScore = session?.role === "super_admin" || session?.role === "evaluator";

  return (
    <div>
      <h1 className="font-display text-balance text-3xl font-semibold md:text-4xl">
        Good day, {givenName}
      </h1>
      <p className="mt-2 max-w-[62ch] text-pretty text-muted-foreground">
        Where tenders sit, what closes this week, and which scores are still
        open.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={FolderOpen}
          label="Open for bids"
          value={openCount}
          hint={`of ${tenders.length} tenders in the register`}
        />
        <StatTile
          icon={CalendarClock}
          label="Closing this week"
          value={closingSoon.length}
          hint="Published, closing within 7 days"
          accent
        />
        <StatTile
          icon={ClipboardCheck}
          label="Still to score"
          value={unscored.length}
          hint="Bids waiting for an evaluator"
        />
      </div>

      <section className={cn(surface, "mt-6 p-5 md:p-6")}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-display text-xl font-semibold">Pipeline by status</h2>
          <p className="text-sm text-muted-foreground">
            {tenders.length} tenders, in lifecycle order
          </p>
        </div>
        <div className="mt-4">
          <PipelineChart counts={counts} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Panel icon={CalendarClock} title="Closing this week" count={closingSoon.length}>
          {closingSoon.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              text="Nothing published closes in the next seven days."
            />
          ) : (
            <ul className="divide-y divide-border">
              {closingSoon.map((tender) => (
                <li key={tender.id}>
                  <Link
                    href={`/desk/tenders/${tender.id}`}
                    className="group flex min-h-16 items-center gap-4 px-5 py-3 outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    {tender.closingAt ? <DateTile iso={tender.closingAt} /> : null}
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="text-pretty font-medium">{tender.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {tender.closingAt
                          ? `${daysLabel(new Date(tender.closingAt).getTime() - now)} · ${formatDate(tender.closingAt)}`
                          : tender.department}
                      </span>
                    </span>
                    <ChevronRight
                      className="size-5 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          icon={ClipboardCheck}
          title="Still to score"
          count={unscored.length}
          footer={
            canScore ? (
              <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
                <Link href="/desk/evaluations">Open scores</Link>
              </Button>
            ) : null
          }
        >
          {unscored.length === 0 ? (
            <EmptyState icon={CheckCircle2} text="Every assigned bid has a score." />
          ) : (
            <ul className="divide-y divide-border">
              {unscored.map((item) => {
                const tender = tenders.find((row) => row.id === item.tenderId);
                return (
                  <li key={item.id}>
                    <Link
                      href={tender ? `/desk/tenders/${tender.id}` : "/desk/tenders"}
                      className="group flex min-h-16 items-center gap-4 px-5 py-3 outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-14 shrink-0 place-items-center rounded-[0.75rem] bg-muted font-display text-lg font-semibold text-muted-foreground"
                      >
                        {item.contractor.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="grid min-w-0 flex-1 gap-0.5">
                        <span className="font-medium">{item.contractor}</span>
                        <span className="text-sm text-muted-foreground">
                          {tender ? tender.title : "Tender not found"}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-status-draft-bg px-2.5 py-0.5 text-xs font-semibold text-status-draft-fg">
                        No score yet
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
