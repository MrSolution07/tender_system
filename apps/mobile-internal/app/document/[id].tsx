import { Stack, useLocalSearchParams } from "expo-router";

import { Body, QuietButton, Screen, Title } from "@/src/kit";

export default function DocumentScreen() {
  const params = useLocalSearchParams<{ name?: string }>();
  const fileName = typeof params.name === "string" ? params.name : "File";

  return (
    <Screen>
      <Stack.Screen options={{ title: "Document" }} />
      <Title>{fileName}</Title>
      <Body>The file name is on the register. Open it from a signed link when the file is in storage.</Body>
      <QuietButton label="Back" href="/tenders" />
    </Screen>
  );
}
