"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRand } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function TenderDetailPage() {
  const params = useParams<{ id: string }>();
  const { ready, tenders } = useStore();
  const tender = tenders.find(
    (item) => item.id === params.id && item.status === "published",
  );

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-32 w-full rounded-[1rem]" />
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-semibold">
          Notice not on the public record
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          This tender is missing, still a draft, or already closed. Open notices
          are listed separately from awards.
        </p>
        <Button asChild className="mt-6 h-11">
          <Link href="/tenders">Back to open notices</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-6xl px-6 py-10 md:py-12">
      <Link
        href="/tenders"
        className="inline-flex h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
        Open notices
      </Link>

      <header className="mt-2">
        <p className="text-sm text-muted-foreground">{tender.department}</p>
        <h1 className="mt-2 max-w-[28ch] font-display leading-tight text-balance text-4xl font-semibold md:text-5xl">
          {tender.title}
        </h1>
        <div className="mt-4">
          <StatusBadge status={tender.status} />
        </div>
      </header>

      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start md:gap-12">
        <div>
          <h2 className="font-display text-2xl font-semibold">About this tender</h2>
          <p className="mt-3 max-w-[65ch] text-pretty leading-7">
            {tender.description}
          </p>

          <h2 className="mt-10 font-display text-2xl font-semibold">
            Requirements
          </h2>
          <ol className="mt-4 grid gap-3">
            {tender.requirements.map((requirement, index) => (
              <li
                key={requirement.id}
                className="flex gap-4 rounded-[0.75rem] border border-border bg-card p-4"
              >
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground tabular-nums"
                >
                  {index + 1}
                </span>
                <span className="min-w-0 text-pretty">
                  {requirement.body}
                  {requirement.mandatory ? (
                    <span className="ml-2 inline-block rounded-full bg-muted px-2 py-0.5 align-middle text-xs font-medium text-muted-foreground">
                      Mandatory
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <aside
          aria-label="Key facts"
          className="rounded-[1rem] border border-border bg-card p-6 md:sticky md:top-24"
        >
          <h2 className="font-display text-lg font-semibold">Key facts</h2>
          <dl className="mt-4 divide-y divide-border">
            <div className="pb-4">
              <dt className="text-sm text-muted-foreground">Closing date</dt>
              <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {tender.closingAt ? formatDate(tender.closingAt) : "Not set"}
              </dd>
            </div>
            <div className="py-4">
              <dt className="text-sm text-muted-foreground">Budget</dt>
              <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {formatRand(tender.budgetCents)}
              </dd>
            </div>
            <div className="py-4">
              <dt className="text-sm text-muted-foreground">Category</dt>
              <dd className="mt-1 font-medium">{tender.category}</dd>
            </div>
            <div className="pt-4">
              <dt className="text-sm text-muted-foreground">Department</dt>
              <dd className="mt-1 font-medium">{tender.department}</dd>
            </div>
          </dl>
          <p className="mt-5 border-t border-border pt-4 text-sm text-pretty text-muted-foreground">
            Bids, scores, and contact details are not published here.
          </p>
        </aside>
      </div>
    </article>
  );
}
