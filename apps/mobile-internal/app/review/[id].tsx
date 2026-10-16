import { REVIEW_STATUS_LABEL } from "@tender/fixtures";
import type { AiReviewStatus } from "@tender/shared";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Badge, Body, PrimaryButton, QuietButton, Screen, Title } from "@/src/kit";
import { loadReviews, setReviewStatus, type DeskReview } from "@/src/queries";

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [review, setReview] = useState<DeskReview | null | undefined>(undefined);

  useEffect(() => {
    if (typeof id !== "string") {
      setReview(null);
      return;
    }
    void loadReviews().then((rows) => setReview(rows.find((item) => item.id === id) ?? null));
  }, [id]);

  if (!review) {
    return (
      <Screen>
        <Title>{review === undefined ? "Loading the suggestion." : "Suggestion not found"}</Title>
        <QuietButton label="Back to suggestions" href="/reviews" />
      </Screen>
    );
  }

  const current = review;
  async function mark(status: "approved" | "corrected") {
    const ok = await setReviewStatus(current.id, status);
    if (ok) router.replace(`/held?kind=review&to=${status}`);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Suggestion" }} />
      <Badge label={REVIEW_STATUS_LABEL[review.reviewStatus as AiReviewStatus] ?? review.reviewStatus} />
      <Title>{review.title}</Title>
      <Body>Suggested. A person still has to review this. Model: {review.model}.</Body>
      <Body>{review.summary}</Body>
      <PrimaryButton label="Approve" onPress={() => void mark("approved")} />
      <QuietButton label="Correct" onPress={() => void mark("corrected")} />
      <QuietButton label="Open tender" href={`/tender/${current.tenderId}`} />
    </Screen>
  );
}
