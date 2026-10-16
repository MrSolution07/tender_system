import {
  formatDate,
  formatRand,
  TENDER_STATUS_LABEL,
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
  Screen,
  Title,
} from "@/src/kit";
import { useSession } from "@/src/session";

export default function TenderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const tender = typeof id === "string" ? tenderById(id) : undefined;
  const visible = tender?.status === "published" ? tender : undefined;

  if (!visible) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Notice" }} />
        <Title>Notice not on the public record</Title>
        <Body>
          This tender is missing, still a draft, or already closed. Open
          notices are listed separately from awards.
        </Body>
        <QuietButton label="Back to open notices" href="/" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Notice" }} />
      <Body>{visible.department}</Body>
      <Title>{visible.title}</Title>
      <Badge label={TENDER_STATUS_LABEL[visible.status]} />
      <Fact label="Category" value={visible.category} />
      <Fact
        label="Closes"
        value={visible.closingAt ? formatDate(visible.closingAt) : "Not set"}
      />
      <Fact label="Budget" value={formatRand(visible.budgetCents)} />
      <Body>{visible.description}</Body>
      <Heading>Requirements</Heading>
      {visible.requirements.map((requirement) => (
        <Body key={requirement.id}>{requirement.body}</Body>
      ))}
      {session ? (
        <PrimaryButton
          label="Prepare a bid"
          href={`/bid/new?tenderId=${visible.id}`}
        />
      ) : (
        <QuietButton label="Sign in to prepare a bid" href="/sign-in" />
      )}
    </Screen>
  );
}
