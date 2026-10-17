import { formatDate, formatRand, PROJECT_STATUS_LABEL } from "@tender/fixtures";
import type { ProjectStatus } from "@tender/shared";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Body, Fact, Figure, Heading, QuietButton, Screen, Title } from "@/src/kit";
import { loadAwards, type LiveAward } from "@/src/queries";

export default function AwardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [award, setAward] = useState<LiveAward | null | undefined>(undefined);

  useEffect(() => {
    if (typeof id !== "string") {
      setAward(null);
      return;
    }
    void loadAwards().then((awards) => setAward(awards.find((item) => item.id === id) ?? null));
  }, [id]);

  if (!award) {
    return (
      <Screen>
        <Title>{award === undefined ? "Loading the award." : "Award not on the record"}</Title>
        <QuietButton label="Back to awards" href="/awards" />
      </Screen>
    );
  }

  const total = award.spend.reduce((sum, line) => sum + line.amountCents, 0);
  const status = PROJECT_STATUS_LABEL[award.projectStatus as ProjectStatus] ?? award.projectStatus;

  return (
    <Screen>
      <Stack.Screen options={{ title: "Award" }} />
      <Title>{award.projectTitle}</Title>
      <Body>{award.contractor}</Body>
      <Fact label="Place" value={award.locationLabel || "Not set"} />
      <Fact label="Awarded" value={award.awardedAt ? formatDate(award.awardedAt) : "Not set"} />
      <Fact label="Progress" value={`${status}, ${award.progressPercent}%`} />
      <Heading>Spend on record</Heading>
      <Figure>{formatRand(total)}</Figure>
      {award.spend.map((line) => (
        <Fact key={line.id} label={line.label} value={formatRand(line.amountCents)} />
      ))}
    </Screen>
  );
}
