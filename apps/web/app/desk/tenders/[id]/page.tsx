"use client";

import { TENDER_TRANSITIONS, type TenderStatus } from "@tender/shared";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { TenderDesk } from "@/components/tender-desk";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatDate, formatRand } from "@/lib/format";
import { useStore } from "@/lib/store";

const ACTION: Record<TenderStatus, string> = {
  draft: "Return to draft",
  published: "Publish",
  closed: "Close",
  evaluating: "Start evaluation",
  awarded: "Mark awarded",
  completed: "Mark completed",
  archived: "Archive",
};

export default function DeskTenderPage() {
  const params = useParams<{ id: string }>();
  const { tenders, reviews, session, setStatus, reload } = useStore();
  const [statusError, setStatusError] = useState<string | null>(null);
  const tender = tenders.find((item) => item.id === params.id);
  const suggestion = tender
    ? reviews.find((review) => review.tenderId === tender.id)
    : undefined;
  const canChange =
    session?.role === "procurement_officer" || session?.role === "super_admin";

  if (!tender) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold">Tender not found</h1>
        <Button asChild className="mt-6 h-11">
          <Link href="/desk/tenders">Back to tenders</Link>
        </Button>
      </div>
    );
  }

  const current = tender;
  const nextStatuses = TENDER_TRANSITIONS[current.status];

  async function move(status: TenderStatus) {
    if (status === "published") {
      if (!current.closingAt) {
        setStatusError("Add a closing date before publishing.");
        return;
      }
      if (current.requirements.length === 0) {
        setStatusError("Add a requirement before publishing.");
        return;
      }
      if (current.documents.length === 0) {
        setStatusError("Upload a pack file before publishing.");
        return;
      }
    }
    if (status === "awarded") {
      setStatusError("Record the award from the bids section, with a winning bid.");
      return;
    }
    setStatusError(await setStatus(current.id, status));
  }

  return (
    <article>
      <p className="text-sm text-muted-foreground">{current.department}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-balance text-4xl font-semibold">{tender.title}</h1>
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
          <dd className="mt-1 font-medium tabular-nums">{formatRand(tender.budgetCents)}</dd>
        </div>
      </dl>
      <p className="mt-8 max-w-[65ch] text-pretty leading-7">{tender.description}</p>

      <TenderDesk
        tender={current}
        suggestion={suggestion}
        canChange={canChange}
        onChanged={reload}
      />

      {suggestion ? (
        <section className="mt-10 border-y border-border py-6">
          <h2 className="font-display text-2xl font-semibold">Suggested</h2>
          <p className="mt-3 max-w-[65ch] text-pretty">{suggestion.summary}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Model {suggestion.model}. This text does not change the tender until a
            person reviews it on the suggestions page.
          </p>
        </section>
      ) : null}

      {canChange ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {nextStatuses
            .filter((status) => status !== "archived" && status !== "awarded")
            .map((status) => (
              <Button key={status} className="h-11" onClick={() => move(status)}>
                {ACTION[status]}
              </Button>
            ))}
          {nextStatuses.includes("archived") ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-11">
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive this tender?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Archived tenders leave the active pipeline. They stay on the
                    register under the archived filter.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction onClick={() => move("archived")}>
                    Archive
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          Evaluators read this tender. Status changes stay with procurement.
        </p>
      )}
      {statusError ? (
        <Alert className="mt-4">
          <AlertTitle>Status not changed</AlertTitle>
          <AlertDescription>{statusError}</AlertDescription>
        </Alert>
      ) : null}
    </article>
  );
}
