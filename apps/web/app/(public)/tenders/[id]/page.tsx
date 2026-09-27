"use client";

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
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-32 w-full" />
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-semibold">Notice not on the public record</h1>
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
    <article className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm text-muted-foreground">{tender.department}</p>
      <h1 className="mt-2 font-display text-balance text-4xl font-semibold">
        {tender.title}
      </h1>
      <div className="mt-4">
        <StatusBadge status={tender.status} />
      </div>
      <dl className="mt-8 grid gap-6 border-y border-border py-6 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Category</dt>
          <dd className="mt-1 font-medium">{tender.category}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Closes</dt>
          <dd className="mt-1 font-medium tabular-nums">
            {tender.closingAt ? formatDate(tender.closingAt) : "Not set"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Budget</dt>
          <dd className="mt-1 font-medium tabular-nums">
            {formatRand(tender.budgetCents)}
          </dd>
        </div>
      </dl>
      <p className="mt-8 max-w-[65ch] text-pretty leading-7">{tender.description}</p>
      <h2 className="mt-10 font-display text-2xl font-semibold">Requirements</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-pretty">
        {tender.requirements.map((requirement) => (
          <li key={requirement.id}>{requirement.body}</li>
        ))}
      </ul>
    </article>
  );
}
