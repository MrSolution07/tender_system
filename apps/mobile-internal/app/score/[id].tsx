import { sampleEvaluations, tenderById } from "@tender/fixtures";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
  Body,
  Field,
  PrimaryButton,
  QuietButton,
  Screen,
  Title,
} from "@/src/kit";

export default function ScoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const evaluation =
    typeof id === "string"
      ? sampleEvaluations.find((item) => item.id === id)
      : undefined;
  const tender = evaluation ? tenderById(evaluation.tenderId) : undefined;
  const [score, setScore] = useState(
    evaluation?.score === null || evaluation?.score === undefined
      ? ""
      : String(evaluation.score),
  );
  const [comments, setComments] = useState(evaluation?.comments ?? "");

  if (!evaluation || !tender) {
    return (
      <Screen>
        <Title>Score not in the sample</Title>
        <QuietButton label="Back to scores" href="/scores" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Score" }} />
      <Title>{evaluation.contractor}</Title>
      <Body>{tender.title}</Body>
      <Body>Scores stay on the desk. Save does not write them.</Body>
      <Field label="Score" value={score} onChangeText={setScore} />
      <Field
        label="Comments"
        value={comments}
        onChangeText={setComments}
        multiline
      />
      <PrimaryButton label="Save score" href="/held?kind=score" />
    </Screen>
  );
}
