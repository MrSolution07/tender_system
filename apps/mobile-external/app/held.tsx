import { Stack } from "expo-router";

import { Body, QuietButton, Screen, Title } from "@/src/kit";

export default function HeldScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: "Bid" }} />
      <Title>Bid submitted</Title>
      <Body>The bid is on the register. You can see it under Bids.</Body>
      <QuietButton label="Back to bids" href="/bids" />
    </Screen>
  );
}
