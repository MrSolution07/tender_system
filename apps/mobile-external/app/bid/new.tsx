import { formatRand } from "@tender/fixtures";
import { Redirect, Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Body, Field, FormError, PrimaryButton, QuietButton, Screen, Title } from "@/src/kit";
import { loadTender, submitBid } from "@/src/queries";
import { useSession } from "@/src/session";

export default function NewBidScreen() {
  const { session } = useSession();
  const params = useLocalSearchParams<{ tenderId?: string }>();
  const tenderId = typeof params.tenderId === "string" ? params.tenderId : "";
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState(0);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tenderId) return;
    void loadTender(tenderId).then((tender) => {
      setTitle(tender?.title ?? "");
      setBudget(tender?.budgetCents ?? 0);
    });
  }, [tenderId]);

  if (!session) return <Redirect href="/sign-in" />;

  async function submit() {
    const rands = Number(amount.replace(/,/g, ""));
    if (!Number.isFinite(rands) || rands <= 0) {
      setError("Enter the bid amount in rands.");
      return;
    }
    const message = await submitBid(tenderId, Math.round(rands * 100), note.trim());
    if (message) {
      setError(message);
      return;
    }
    router.replace("/held?kind=bid");
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Prepare a bid" }} />
      <Title>Prepare a bid</Title>
      <Body>
        {title || "Notice"}. Budget on the notice is {formatRand(budget)}.
      </Body>
      <Field label="Amount (ZAR)" value={amount} onChangeText={setAmount} />
      <Field label="Note" value={note} onChangeText={setNote} multiline />
      {error ? <FormError>{error}</FormError> : null}
      <PrimaryButton label="Submit bid" onPress={() => void submit()} />
      <QuietButton label="Back to notices" href="/" />
    </Screen>
  );
}
