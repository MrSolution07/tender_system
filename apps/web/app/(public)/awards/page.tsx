"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/progress-bar";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRand } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function AwardsPage() {
  const { ready, awards } = useStore();
  const spend = awards.reduce(
    (sum, award) =>
      sum + award.spend.reduce((inner, line) => inner + line.amountCents, 0),
    0,
  );
  const completed = awards.filter(
    (award) => award.projectStatus === "completed",
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-balance text-4xl font-semibold">Awards</h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        Contractor, progress, and spend. Scores and the other bids are not
        published here.
      </p>

      <section
        aria-label="Spend summary"
        className="mt-8 flex flex-col gap-6 rounded-[1rem] border border-border bg-card p-6 md:flex-row md:items-end md:justify-between md:p-8"
      >
        <div>
          <p className="font-display text-5xl font-semibold text-highlight tabular-nums">
            {ready ? formatRand(spend) : "—"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Recorded spend on these awards
          </p>
        </div>
        {ready ? (
          <dl className="flex gap-10">
            <div>
              <dd className="font-display text-3xl font-semibold tabular-nums">
                {awards.length}
              </dd>
              <dt className="text-sm text-muted-foreground">
                {awards.length === 1 ? "Award" : "Awards"}
              </dt>
            </div>
            <div>
              <dd className="font-display text-3xl font-semibold tabular-nums">
                {completed}
              </dd>
              <dt className="text-sm text-muted-foreground">Completed</dt>
            </div>
          </dl>
        ) : null}
      </section>

      {!ready ? (
        <Skeleton className="mt-6 h-40 w-full rounded-[1rem]" />
      ) : (
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-[1rem] border border-border bg-card">
          {awards.map((award) => (
            <li key={award.id}>
              <Link
                href={`/awards/${award.id}`}
                className="group grid gap-4 px-4 py-5 outline-none transition-colors hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:grid-cols-[minmax(0,1fr)_15rem] md:items-center md:gap-8 md:px-6"
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium underline-offset-4 group-hover:underline">
                      {award.projectTitle}
                    </span>
                    <ProjectStatusBadge status={award.projectStatus} />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {award.contractor} · {award.locationLabel}
                  </span>
                </span>
                <span className="block">
                  <span className="flex items-baseline justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold tabular-nums">
                      {award.progressPercent}%
                    </span>
                  </span>
                  <ProgressBar
                    className="mt-2"
                    percent={award.progressPercent}
                    label={`Progress on ${award.projectTitle}`}
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
