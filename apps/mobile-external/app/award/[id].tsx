import {
  formatDate,
  formatRand,
  PROJECT_STATUS_LABEL,
  sampleAwards,
} from "@tender/fixtures";
import { Stack, useLocalSearchParams } from "expo-router";

import { Body, Fact, Figure, Heading, QuietButton, Screen, Title } from "@/src/kit";

export default function AwardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const award =
    typeof id === "string"
      ? sampleAwards.find((item) => item.id === id)
      : undefined;

  if (!award) {
    return (
      <Screen>
        <Title>Award not on the record</Title>
        <QuietButton label="Back to awards" href="/awards" />
      </Screen>
    );
  }

  const total = award.spend.reduce((sum, line) => sum + line.amountCents, 0);

  return (
    <Screen>
      <Stack.Screen options={{ title: "Award" }} />
      <Title>{award.projectTitle}</Title>
      <Body>{award.contractor}</Body>
      <Fact label="Place" value={award.locationLabel} />
      <Fact label="Awarded" value={formatDate(award.awardedAt)} />
      <Fact
        label="Progress"
        value={`${PROJECT_STATUS_LABEL[award.projectStatus]}, ${award.progressPercent}%`}
      />
      <Heading>Spend on record</Heading>
      <Figure>{formatRand(total)}</Figure>
      {award.spend.map((line) => (
        <Fact key={line.id} label={line.label} value={formatRand(line.amountCents)} />
      ))}
    </Screen>
  );
}
