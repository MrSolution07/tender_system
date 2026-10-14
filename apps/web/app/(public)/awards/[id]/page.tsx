"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRand } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function AwardDetailPage() {
  const params = useParams<{ id: string }>();
  const { ready, awards, tenders } = useStore();
  const award = awards.find((item) => item.id === params.id);
  const tender = award
    ? tenders.find((item) => item.id === award.tenderId)
    : undefined;

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-32 w-full rounded-[1rem]" />
      </div>
    );
  }

  if (!award) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-semibold">Award not found</h1>
        <Button asChild className="mt-6 h-11">
          <Link href="/awards">Back to awards</Link>
        </Button>
      </div>
    );
  }

  const spent = award.spend.reduce((sum, line) => sum + line.amountCents, 0);

  return (
    <article className="mx-auto max-w-6xl px-6 py-10 md:py-12">
      <Link
        href="/awards"
        className="inline-flex h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
        Awards
      </Link>

      <header className="mt-2">
        <p className="text-sm text-muted-foreground">{award.locationLabel}</p>
        <h1 className="mt-2 max-w-[28ch] font-display leading-tight text-balance text-4xl font-semibold md:text-5xl">
          {award.projectTitle}
        </h1>
        <p className="mt-4 text-lg">{award.contractor}</p>
      </header>

      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start md:gap-12">
        <div>
          <section
            aria-label="Progress"
            className="rounded-[1rem] border border-border bg-card p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ProjectStatusBadge status={award.projectStatus} />
              <p className="font-display text-3xl font-semibold tabular-nums">
                {award.progressPercent}%
                <span className="ml-2 font-sans text-sm font-normal text-muted-foreground">
                  complete
                </span>
              </p>
            </div>
            <ProgressBar
              className="mt-4 h-3"
              percent={award.progressPercent}
              label="Project progress"
            />
          </section>

          {tender ? (
            <>
              <h2 className="mt-10 font-display text-2xl font-semibold">
                About this project
              </h2>
              <p className="mt-3 max-w-[65ch] text-pretty leading-7">
                {tender.description}
              </p>
            </>
          ) : null}

          <h2 className="mt-10 font-display text-2xl font-semibold">
            Spend lines
          </h2>
          <div className="mt-4 overflow-hidden rounded-[1rem] border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium md:px-6">
                    Line
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-medium md:px-6"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {award.spend.map((line) => (
                  <tr key={line.id} className="border-b border-border">
                    <td className="px-4 py-3 md:px-6">{line.label}</td>
                    <td className="px-4 py-3 text-right tabular-nums md:px-6">
                      {formatRand(line.amountCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className="px-4 py-3 font-semibold md:px-6">
                    Total recorded
                  </th>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums md:px-6">
                    {formatRand(spent)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <aside
          aria-label="Key facts"
          className="rounded-[1rem] border border-border bg-card p-6 md:sticky md:top-24"
        >
          <h2 className="font-display text-lg font-semibold">Key facts</h2>
          <dl className="mt-4 divide-y divide-border">
            <div className="pb-4">
              <dt className="text-sm text-muted-foreground">Recorded spend</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-highlight tabular-nums">
                {formatRand(spent)}
              </dd>
            </div>
            <div className="py-4">
              <dt className="text-sm text-muted-foreground">Awarded</dt>
              <dd className="mt-1 font-medium tabular-nums">
                {formatDate(award.awardedAt)}
              </dd>
            </div>
            <div className="py-4">
              <dt className="text-sm text-muted-foreground">Contractor</dt>
              <dd className="mt-1 font-medium">{award.contractor}</dd>
            </div>
            <div className="pt-4">
              <dt className="text-sm text-muted-foreground">Location</dt>
              <dd className="mt-1 font-medium">{award.locationLabel}</dd>
            </div>
          </dl>
          <p className="mt-5 border-t border-border pt-4 text-sm text-pretty text-muted-foreground">
            Other bids and scores are not published.
          </p>
        </aside>
      </div>
    </article>
  );
}
