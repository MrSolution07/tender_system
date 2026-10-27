import { formatRand } from "@tender/fixtures";
import { Redirect, Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { pickFile, type PickedFile } from "@/src/files";
import { Body, Field, FormError, PrimaryButton, QuietButton, Screen, Title } from "@/src/kit";
import { loadTender, submitBid } from "@/src/queries";
import { useSession } from "@/src/session";

export default function NewBidScreen() {
  const { session } = useSession();
  const params = useLocalSearchParams<{ tenderId?: string }>();
  const tenderId = typeof params.tenderId === "string" ? params.tenderId : "";
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState(0);
  const [requirements, setRequirements] = useState<{ id: string; body: string }[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!tenderId) return;
    void loadTender(tenderId).then((tender) => {
      setTitle(tender?.title ?? "");
      setBudget(tender?.budgetCents ?? 0);
      setRequirements(tender?.requirements ?? []);
    });
  }, [tenderId]);

  if (!session) return <Redirect href="/sign-in" />;

  async function addFile() {
    const picked = await pickFile();
    if ("canceled" in picked) return;
    if ("error" in picked) {
      setError(picked.error);
      return;
    }
    setError("");
    setFiles((current) => [...current, picked]);
  }

  async function submit() {
    const rands = Number(amount.replace(/,/g, ""));
    if (!Number.isFinite(rands) || rands <= 0) {
      setError("Enter the bid amount in rands.");
      return;
    }
    setBusy(true);
    const result = await submitBid(
      tenderId,
      Math.round(rands * 100),
      note.trim(),
      files,
      requirements.map((item) => ({ requirementId: item.id, response: responses[item.id] ?? "" })),
    );
    setBusy(false);
    if (result.filesStored) setFiles([]);
    if (result.error) {
      setError(result.error);
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
      {requirements.map((requirement) => (
        <Field
          key={requirement.id}
          label={requirement.body}
          value={responses[requirement.id] ?? ""}
          onChangeText={(value) => setResponses((current) => ({ ...current, [requirement.id]: value }))}
          multiline
        />
      ))}
      {files.map((file) => (
        <Body key={`${file.name}-${file.size}`}>{file.name}</Body>
      ))}
      <QuietButton label="Add attachment" onPress={() => void addFile()} />
      {error ? <FormError>{error}</FormError> : null}
      <PrimaryButton label={busy ? "Submitting" : "Submit bid"} onPress={() => void submit()} />
      <QuietButton label="Back to notices" href="/" />
    </Screen>
  );
}
