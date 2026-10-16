"use client";

import Link from "next/link";
import { LifecycleRail } from "@/components/lifecycle-rail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRand } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const { ready, tenders, awards } = useStore();

  if (!ready) {
    return (
      <div className="bg-primary">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Skeleton className="h-16 w-2/3 bg-primary-foreground/20" />
          <Skeleton className="mt-6 h-6 w-1/2 bg-primary-foreground/15" />
        </div>
      </div>
    );
  }

  const open = tenders.filter((tender) => tender.status === "published");
  const completed = awards.filter(
    (award) => award.projectStatus === "completed",
  );
  const spend = awards.reduce(
    (sum, award) =>
      sum + award.spend.reduce((inner, line) => inner + line.amountCents, 0),
    0,
  );

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="band-enter mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.9fr)] md:py-24">
          <div>
            <h1 className="font-display text-balance text-4xl font-semibold leading-tight md:text-6xl">
              What was published. What was awarded.
            </h1>
            <p className="mt-6 max-w-[62ch] text-pretty text-lg text-primary-foreground/90">
              Major Tech shows the public record of government tenders. The
              figures below are sample data from a fictional register.
            </p>
            <Button
              asChild
              className="mt-8 h-11 bg-white px-4 text-primary hover:bg-white/90"
            >
              <Link href="/tenders">Read open notices</Link>
            </Button>
          </div>
          <LifecycleRail
            className="w-full max-w-sm md:justify-self-end"
            openCount={open.length}
            awardCount={awards.length}
            completedCount={completed.length}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-balance text-3xl font-semibold">
            Open notices
          </h2>
          <Link href="/tenders" className="text-sm font-semibold text-primary">
            All tenders
          </Link>
        </div>
        <NoticeList
          rows={open.slice(0, 3).map((tender) => ({
            href: `/tenders/${tender.id}`,
            title: tender.title,
            meta: tender.department,
            aside: tender.closingAt
              ? `Closes ${new Date(tender.closingAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}`
              : "No closing date",
          }))}
        />
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="font-display text-balance text-3xl font-semibold">
            Money already recorded
          </h2>
          <p className="mt-3 font-display text-5xl font-semibold text-highlight tabular-nums">
            {formatRand(spend)}
          </p>
          <p className="mt-2 max-w-[62ch] text-pretty text-muted-foreground">
            Spend lines on awarded sample projects. Bids, scores, and evaluator
            notes stay off this site.
          </p>
          <div className="mt-8">
            <NoticeList
              rows={awards.map((award) => ({
                href: `/awards/${award.id}`,
                title: award.projectTitle,
                meta: award.contractor,
                aside: `${award.progressPercent}% complete`,
              }))}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function NoticeList({
  rows,
}: {
  rows: { href: string; title: string; meta: string; aside: string }[];
}) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground">
        No open notices in the sample register.{" "}
        <Link href="/awards" className="font-semibold text-primary">
          Read awards
        </Link>
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {rows.map((row) => (
        <li key={row.href}>
          <Link
            href={row.href}
            className="flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:justify-between md:gap-8"
          >
            <span>
              <span className="block font-medium text-foreground">{row.title}</span>
              <span className="text-sm text-muted-foreground">{row.meta}</span>
            </span>
            <span className="text-sm tabular-nums text-muted-foreground">
              {row.aside}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
