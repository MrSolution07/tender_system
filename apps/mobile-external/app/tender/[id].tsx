import { formatDate, formatRand, TENDER_STATUS_LABEL } from "@tender/fixtures";
import type { TenderStatus } from "@tender/shared";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

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
import { loadTender, type LiveTender } from "@/src/queries";
import { useSession } from "@/src/session";

export default function TenderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const [tender, setTender] = useState<LiveTender | null | undefined>(undefined);

  useEffect(() => {
    if (typeof id !== "string") {
      setTender(null);
      return;
    }
    void loadTender(id).then(setTender);
  }, [id]);

  if (tender === undefined) {
    return (
      <Screen>
        <Body>Loading the notice.</Body>
      </Screen>
    );
  }

  if (!tender) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Notice" }} />
        <Title>Notice not on the public record</Title>
        <Body>This tender is missing or not published.</Body>
        <QuietButton label="Back to open notices" href="/" />
      </Screen>
    );
  }

  const status = tender.status as TenderStatus;

  return (
    <Screen>
      <Stack.Screen options={{ title: "Notice" }} />
      <Title>{tender.title}</Title>
      <Body>{tender.department}</Body>
      <Badge label={TENDER_STATUS_LABEL[status] ?? tender.status} />
      <Fact label="Category" value={tender.category} />
      <Fact label="Closes" value={tender.closingAt ? formatDate(tender.closingAt) : "Not set"} />
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
          href={{ pathname: "/document/[id]", params: { id: document.id, path: document.path, name: document.fileName } }}
          title={document.fileName}
          meta="Open"
        />
      ))}
      {session ? (
        <PrimaryButton label="Prepare a bid" href={`/bid/new?tenderId=${tender.id}`} />
      ) : (
        <QuietButton label="Sign in to prepare a bid" href="/sign-in" />
      )}
    </Screen>
  );
}
