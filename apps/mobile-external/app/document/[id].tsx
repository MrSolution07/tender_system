import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking } from "react-native";

import { Body, FormError, PrimaryButton, Screen, Title } from "@/src/kit";
import { openDocument } from "@/src/queries";

export default function DocumentScreen() {
  const params = useLocalSearchParams<{ id: string; name?: string; path?: string }>();
  const fileName = typeof params.name === "string" ? params.name : "File";
  const path = typeof params.path === "string" ? params.path : "";
  const [error, setError] = useState("");

  async function open() {
    const result = await openDocument(path);
    if (!result.url) {
      setError(result.error);
      return;
    }
    await Linking.openURL(result.url);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Document" }} />
      <Title>{fileName}</Title>
      <Body>Opens a short-lived link to the file.</Body>
      {error ? <FormError>{error}</FormError> : null}
      <PrimaryButton label="Open file" onPress={() => void open()} />
    </Screen>
  );
}
