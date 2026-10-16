import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Body, Field, FormError, PrimaryButton, QuietButton, Screen, Title } from "@/src/kit";
import { loadEvaluations, saveScore, type DeskEvaluation } from "@/src/queries";

export default function ScoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [evaluation, setEvaluation] = useState<DeskEvaluation | null | undefined>(undefined);
  const [score, setScore] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof id !== "string") {
      setEvaluation(null);
      return;
    }
    void loadEvaluations().then((rows) => {
      const found = rows.find((item) => item.id === id) ?? null;
      setEvaluation(found);
      setScore(found?.score === null || found?.score === undefined ? "" : String(found.score));
      setComments(found?.comments ?? "");
    });
  }, [id]);

  if (!evaluation) {
    return (
      <Screen>
        <Title>{evaluation === undefined ? "Loading the score." : "Score not found"}</Title>
        <QuietButton label="Back to scores" href="/scores" />
      </Screen>
    );
  }

  const current = evaluation;
  async function save() {
    const value = Number(score);
    if (!Number.isFinite(value)) {
      setError("Enter a numeric score.");
      return;
    }
    const ok = await saveScore(current.id, value, comments);
    if (!ok) {
      setError("Could not save the score.");
      return;
    }
    router.replace("/held?kind=score");
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Score" }} />
      <Title>{evaluation.contractor}</Title>
      <Body>{evaluation.title}</Body>
      <Body>Scores stay on the desk.</Body>
      <Field label="Score" value={score} onChangeText={setScore} />
      <Field label="Comments" value={comments} onChangeText={setComments} multiline />
      {error ? <FormError>{error}</FormError> : null}
      <PrimaryButton label="Save score" onPress={() => void save()} />
    </Screen>
  );
}
