import { Stack, useLocalSearchParams } from "expo-router";

import { Body, QuietButton, Screen, Title } from "@/src/kit";

export default function HeldScreen() {
  const params = useLocalSearchParams<{ kind?: string }>();
  const kind = typeof params.kind === "string" ? params.kind : "preview";
  const bid = kind === "bid";

  return (
    <Screen>
      <Stack.Screen options={{ title: "Preview" }} />
      <Title>{bid ? "Bid not sent" : "Nothing was saved"}</Title>
      <Body>
        {bid
          ? "The amount stayed in the form. No bid was submitted."
          : "This preview does not write to the register."}
      </Body>
      <QuietButton label="Back to bids" href="/bids" />
    </Screen>
  );
}
