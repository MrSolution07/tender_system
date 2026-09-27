"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRand } from "@/lib/format";
import { PROJECT_STATUS_LABEL } from "@/lib/labels";
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
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Skeleton className="h-10 w-2/3" />
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
    <article className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm text-muted-foreground">{award.locationLabel}</p>
      <h1 className="mt-2 font-display text-balance text-4xl font-semibold">
        {award.projectTitle}
      </h1>
      <p className="mt-4 text-lg">{award.contractor}</p>
      <dl className="mt-8 grid gap-6 border-y border-border py-6 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Awarded</dt>
          <dd className="mt-1 font-medium tabular-nums">{formatDate(award.awardedAt)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Progress</dt>
          <dd className="mt-1 font-medium">
            {PROJECT_STATUS_LABEL[award.projectStatus]} · {award.progressPercent}%
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Recorded spend</dt>
          <dd className="mt-1 font-medium text-highlight tabular-nums">
            {formatRand(spent)}
          </dd>
        </div>
      </dl>
      <div
        className="mt-6 h-2 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={award.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Project progress"
      >
        <div
          className="h-full bg-primary"
          style={{ width: `${award.progressPercent}%` }}
        />
      </div>
      {tender ? (
        <p className="mt-8 max-w-[65ch] text-pretty leading-7">{tender.description}</p>
      ) : null}
      <h2 className="mt-10 font-display text-2xl font-semibold">Spend lines</h2>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th scope="col" className="py-2 font-medium">
              Line
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {award.spend.map((line) => (
            <tr key={line.id} className="border-b border-border">
              <td className="py-3">{line.label}</td>
              <td className="py-3 text-right tabular-nums">{formatRand(line.amountCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
