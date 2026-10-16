import { documentById } from "@tender/fixtures";
import { Stack, useLocalSearchParams } from "expo-router";

import { Body, QuietButton, Screen, Title } from "@/src/kit";

export default function DocumentScreen() {
  const params = useLocalSearchParams<{ id: string; name?: string }>();
  const found = typeof params.id === "string" ? documentById(params.id) : undefined;
  const fileName =
    found?.fileName ??
    (typeof params.name === "string" ? params.name : "File");

  return (
    <Screen>
      <Stack.Screen options={{ title: "Document" }} />
      <Title>{fileName}</Title>
      {found ? <Body>{found.tenderTitle}</Body> : null}
      <Body>This preview lists the file and does not open it.</Body>
      <QuietButton label="Back" href="/tenders" />
    </Screen>
  );
}
