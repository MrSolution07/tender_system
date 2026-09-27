"use client";

import { TENDER_STATUSES } from "@tender/shared";
import Link from "next/link";
import { PipelineChart } from "@/components/pipeline-chart";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

const DAY = 24 * 60 * 60 * 1000;

export default function PipelinePage() {
  const { tenders, evaluations, session } = useStore();
  const now = Date.now();
  const counts = TENDER_STATUSES.map((status) => ({
    status,
    count: tenders.filter((tender) => tender.status === status).length,
  }));
  const closingSoon = tenders.filter((tender) => {
    if (tender.status !== "published" || !tender.closingAt) return false;
    const delta = new Date(tender.closingAt).getTime() - now;
    return delta >= 0 && delta <= 7 * DAY;
  });
  const unscored = evaluations.filter((item) => item.score === null);

  const givenName = session
    ? (session.name.split(" ")[0] ?? session.name)
    : "there";

  return (
    <div>
      <h1 className="font-display text-balance text-4xl font-semibold">
        Good day, {givenName}
      </h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        Where the sample tenders sit, what closes this week, and which scores
        are still open.
      </p>

      <div className="mt-8 border-y border-border py-6">
        <PipelineChart counts={counts} />
      </div>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold">
            Closing this week
            {closingSoon.length > 0 ? (
              <span className="ml-3 text-highlight tabular-nums">{closingSoon.length}</span>
            ) : null}
          </h2>
          {closingSoon.length === 0 ? (
            <p className="mt-4 text-muted-foreground">
              Nothing published closes in the next seven days.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {closingSoon.map((tender) => (
                <li key={tender.id}>
                  <Link href={`/desk/tenders/${tender.id}`} className="block py-3">
                    <span className="font-medium">{tender.title}</span>
                    <span className="mt-1 block text-sm tabular-nums text-muted-foreground">
                      {tender.closingAt ? formatDate(tender.closingAt) : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold">Still to score</h2>
          {unscored.length === 0 ? (
            <p className="mt-4 text-muted-foreground">Every sample bid has a score.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {unscored.map((item) => (
                <li key={item.id} className="py-3">
                  <p className="font-medium">{item.contractor}</p>
                  <p className="text-sm text-muted-foreground">No score yet</p>
                </li>
              ))}
            </ul>
          )}
          {session?.role === "super_admin" || session?.role === "evaluator" ? (
            <Button asChild variant="outline" className="mt-4 h-11">
              <Link href="/desk/evaluations">Open scores</Link>
            </Button>
          ) : null}
        </section>
      </div>
    </div>
  );
}
