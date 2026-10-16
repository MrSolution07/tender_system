import { formatRand, tenderById } from "@tender/fixtures";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { Body, Field, PrimaryButton, QuietButton, Screen, Title } from "@/src/kit";
import { useSession } from "@/src/session";

export default function NewBidScreen() {
  const { session } = useSession();
  const params = useLocalSearchParams<{ tenderId?: string }>();
  const tenderId = typeof params.tenderId === "string" ? params.tenderId : "";
  const tender = tenderById(tenderId);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  if (!session) return <Redirect href="/sign-in" />;

  if (!tender || tender.status !== "published") {
    return (
      <Screen>
        <Title>Bid not open</Title>
        <Body>Bids in this preview attach only to a published notice.</Body>
        <QuietButton label="Back to notices" href="/" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Prepare a bid" }} />
      <Title>Prepare a bid</Title>
      <Body>
        {tender.title}. Budget on the notice is {formatRand(tender.budgetCents)}.
        Submit does not send the bid.
      </Body>
      <Field label="Amount (ZAR)" value={amount} onChangeText={setAmount} />
      <Field label="Note" value={note} onChangeText={setNote} multiline />
      <PrimaryButton label="Submit bid" href="/held?kind=bid" />
    </Screen>
  );
}
