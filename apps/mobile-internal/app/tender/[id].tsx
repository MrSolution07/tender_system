import { canTransition, TENDER_STATUSES, type TenderStatus } from "@tender/shared";
import { STATUS_ACTION, TENDER_STATUS_LABEL, formatDate, formatRand } from "@tender/fixtures";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  Badge,
  Body,
  Fact,
  Heading,
  PrimaryButton,
  QuietButton,
  Screen,
  Title,
} from "@/src/kit";
import { loadReviews, loadTenders, setTenderStatus, type DeskReview, type DeskTender } from "@/src/queries";

export default function TenderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tender, setTender] = useState<DeskTender | null | undefined>(undefined);
  const [review, setReview] = useState<DeskReview | null>(null);

  useEffect(() => {
    if (typeof id !== "string") {
      setTender(null);
      return;
    }
    void loadTenders().then((rows) => setTender(rows.find((item) => item.id === id) ?? null));
    void loadReviews().then((rows) => setReview(rows.find((item) => item.tenderId === id) ?? null));
  }, [id]);

  if (!tender) {
    return (
      <Screen>
        <Title>{tender === undefined ? "Loading the tender." : "Tender not found"}</Title>
        <QuietButton label="Back to tenders" href="/tenders" />
      </Screen>
    );
  }

  const destinations = TENDER_STATUSES.filter((status) => canTransition(tender.status, status));

  const current = tender;
  async function move(status: TenderStatus) {
    const ok = await setTenderStatus(current.id, status);
    if (!ok) return;
    router.replace(`/held?kind=status&to=${status}`);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Tender" }} />
      <Badge label={TENDER_STATUS_LABEL[tender.status]} />
      <Title>{tender.title}</Title>
      <Body>{tender.department}</Body>
      <Fact label="Category" value={tender.category} />
      <Fact label="Closes" value={tender.closingAt ? formatDate(tender.closingAt) : "Not set"} />
      <Fact label="Budget" value={formatRand(tender.budgetCents)} />
      <Body>{tender.description}</Body>
      <Heading>Requirements</Heading>
      {tender.requirements.map((requirement) => (
        <Body key={requirement.id}>{requirement.body}</Body>
      ))}
      {review ? (
        <>
          <Heading>Suggested</Heading>
          <Body>{review.summary}</Body>
          <QuietButton label="Open suggestion" href={`/review/${review.id}`} />
        </>
      ) : null}
      <Heading>Status</Heading>
      <Body>A change is saved only when the register allows that step.</Body>
      {destinations.map((status) => (
        <PrimaryButton
          key={status}
          tone={status === "archived" ? "danger" : "brand"}
          label={STATUS_ACTION[status]}
          onPress={() => void move(status)}
        />
      ))}
    </Screen>
  );
}
