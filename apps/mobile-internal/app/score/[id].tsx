import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Body, Field, FormError, PrimaryButton, QuietButton, Screen, Title } from "@/src/kit";
import { loadScoreBoard, saveScoreForBid, type ScoreCard } from "@/src/operate";

export default function ScoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [card, setCard] = useState<ScoreCard | null | undefined>(undefined);
  const [score, setScore] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof id !== "string") {
      setCard(null);
      return;
    }
    void loadScoreBoard().then((rows) => {
      const found = rows.find((item) => item.bidId === id) ?? null;
      setCard(found);
      setScore(found?.score === null || found?.score === undefined ? "" : String(found.score));
      setComments(found?.comments ?? "");
    });
  }, [id]);

  if (!card) {
    return (
      <Screen>
        <Title>{card === undefined ? "Loading the score." : "Score not found"}</Title>
        <QuietButton label="Back to scores" href="/scores" />
      </Screen>
    );
  }

  const current = card;
  async function save() {
    const value = Number(score);
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      setError("Enter a whole score from 0 to 100.");
      return;
    }
    const message = await saveScoreForBid(current.bidId, value, comments);
    if (message) {
      setError(message);
      return;
    }
    router.replace("/held?kind=score");
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Score" }} />
      <Title>{card.contractor}</Title>
      <Body>{card.title}</Body>
      <Body>Scores stay on the desk.</Body>
      <Field label="Score" value={score} onChangeText={setScore} />
      <Field label="Comments" value={comments} onChangeText={setComments} multiline />
      {error ? <FormError>{error}</FormError> : null}
      <PrimaryButton label="Save score" onPress={() => void save()} />
    </Screen>
  );
}
