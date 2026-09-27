"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRand } from "@/lib/format";
import { PROJECT_STATUS_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store";

export default function AwardsPage() {
  const { ready, awards } = useStore();
  const spend = awards.reduce(
    (sum, award) =>
      sum + award.spend.reduce((inner, line) => inner + line.amountCents, 0),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-balance text-4xl font-semibold">Awards</h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        Contractor, progress, and spend. Scores and the other bids are not
        published here.
      </p>
      <p className="mt-8 font-display text-5xl font-semibold text-highlight tabular-nums">
        {ready ? formatRand(spend) : "—"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">Recorded spend on these awards</p>

      {!ready ? (
        <Skeleton className="mt-8 h-40 w-full" />
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {awards.map((award) => (
            <li key={award.id}>
              <Link
                href={`/awards/${award.id}`}
                className="grid gap-2 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline"
              >
                <span>
                  <span className="block font-medium">{award.projectTitle}</span>
                  <span className="text-sm text-muted-foreground">
                    {award.contractor} · {PROJECT_STATUS_LABEL[award.projectStatus]}
                  </span>
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {award.progressPercent}% complete
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
