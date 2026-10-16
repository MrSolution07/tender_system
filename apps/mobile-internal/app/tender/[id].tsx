import { canTransition } from "@tender/shared";
import {
  STATUS_ACTION,
  TENDER_STATUS_LABEL,
  formatDate,
  formatRand,
  sampleReviews,
  tenderById,
} from "@tender/fixtures";
import { Stack, useLocalSearchParams } from "expo-router";

import {
  Badge,
  Body,
  Fact,
  Heading,
  PrimaryButton,
  QuietButton,
  Row,
  Screen,
  Title,
} from "@/src/kit";

export default function TenderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tender = typeof id === "string" ? tenderById(id) : undefined;

  if (!tender) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Tender" }} />
        <Title>Tender not in the sample</Title>
        <Body>That record is not in this preview.</Body>
        <QuietButton label="Back to tenders" href="/tenders" />
      </Screen>
    );
  }

  const review = sampleReviews.find((item) => item.tenderId === tender.id);
  const destinations = (
    ["published", "closed", "evaluating", "awarded", "completed", "archived"] as const
  ).filter((status) => canTransition(tender.status, status));

  return (
    <Screen>
      <Stack.Screen options={{ title: "Tender" }} />
      <Badge label={TENDER_STATUS_LABEL[tender.status]} />
      <Title>{tender.title}</Title>
      <Body>{tender.department}</Body>
      <Fact label="Category" value={tender.category} />
      <Fact
        label="Closes"
        value={tender.closingAt ? formatDate(tender.closingAt) : "Not set"}
      />
      <Fact label="Budget" value={formatRand(tender.budgetCents)} />
      <Body>{tender.description}</Body>
      <Heading>Requirements</Heading>
      {tender.requirements.map((requirement) => (
        <Body key={requirement.id}>{requirement.body}</Body>
      ))}
      <Heading>Documents</Heading>
      {tender.documents.map((document) => (
        <Row
          key={document.id}
          href={`/document/${document.id}`}
          title={document.fileName}
          meta="Listed only"
        />
      ))}
      {review ? (
        <>
          <Heading>Suggested</Heading>
          <Body>{review.summary}</Body>
          <QuietButton label="Open suggestion" href={`/review/${review.id}`} />
        </>
      ) : null}
      <Heading>Status preview</Heading>
      <Body>These buttons open a notice. They do not change the tender.</Body>
      {destinations.map((status) =>
        status === "archived" ? (
          <PrimaryButton
            key={status}
            tone="danger"
            label={STATUS_ACTION[status]}
            href={`/held?kind=status&to=${status}`}
          />
        ) : (
          <PrimaryButton
            key={status}
            label={STATUS_ACTION[status]}
            href={`/held?kind=status&to=${status}`}
          />
        ),
      )}
    </Screen>
  );
}
