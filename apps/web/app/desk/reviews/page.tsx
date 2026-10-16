"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REVIEW_STATUS_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store";

export default function ReviewsPage() {
  const { reviews, tenders, reviewSuggestion } = useStore();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <h1 className="font-display text-balance text-4xl font-semibold">Suggestions</h1>
      <p className="mt-3 max-w-[62ch] text-pretty text-muted-foreground">
        The model writes a suggestion. Approving or correcting it here does not
        change the closing date, the requirements, or the criteria.
      </p>
      {error ? (
        <Alert className="mt-6">
          <AlertTitle>Not updated</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {reviews.map((review) => {
          const tender = tenders.find((item) => item.id === review.tenderId);
          const waiting = review.reviewStatus === "needs_review";
          return (
            <li key={review.id} className="py-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-semibold">
                  {tender?.title ?? "Unknown tender"}
                </h2>
                <Badge variant={waiting ? "secondary" : "outline"}>
                  {waiting ? "Suggested" : REVIEW_STATUS_LABEL[review.reviewStatus]}
                </Badge>
              </div>
              <p className="mt-3 max-w-[65ch] text-pretty">{review.summary}</p>
              <p className="mt-2 text-sm text-muted-foreground">Model {review.model}</p>
              {waiting ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    className="h-11"
                    onClick={() => {
                      const ok = reviewSuggestion(review.id, "approved");
                      setError(
                        ok ? null : "This suggestion was already reviewed.",
                      );
                    }}
                  >
                    Approve suggestion
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11"
                    onClick={() => {
                      const ok = reviewSuggestion(review.id, "corrected");
                      setError(
                        ok ? null : "This suggestion was already reviewed.",
                      );
                    }}
                  >
                    Mark corrected
                  </Button>
                  {tender ? (
                    <Button asChild variant="ghost" className="h-11" static>
                      <Link href={`/desk/tenders/${tender.id}`}>Open tender</Link>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
