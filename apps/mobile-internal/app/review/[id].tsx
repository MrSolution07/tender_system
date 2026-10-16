import {
  REVIEW_STATUS_LABEL,
  sampleReviews,
  tenderById,
} from "@tender/fixtures";
import { Stack, useLocalSearchParams } from "expo-router";

import {
  Badge,
  Body,
  PrimaryButton,
  QuietButton,
  Screen,
  Title,
} from "@/src/kit";

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const review =
    typeof id === "string"
      ? sampleReviews.find((item) => item.id === id)
      : undefined;
  const tender = review ? tenderById(review.tenderId) : undefined;

  if (!review || !tender) {
    return (
      <Screen>
        <Title>Suggestion not in the sample</Title>
        <QuietButton label="Back to suggestions" href="/reviews" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Suggestion" }} />
      <Badge label={REVIEW_STATUS_LABEL[review.reviewStatus]} />
      <Title>{tender.title}</Title>
      <Body>Suggested. A person still has to review this. Model: {review.model}.</Body>
      <Body>{review.summary}</Body>
      <PrimaryButton label="Approve" href="/held?kind=review&to=approved" />
      <QuietButton label="Correct" href="/held?kind=review&to=corrected" />
      <QuietButton label="Open tender" href={`/tender/${tender.id}`} />
    </Screen>
  );
}
