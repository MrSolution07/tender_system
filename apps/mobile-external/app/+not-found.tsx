import { Link, Stack } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { font, theme } from "@/src/kit";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Missing" }} />
      <View
        style={{
          flex: 1,
          backgroundColor: theme.canvas,
          padding: 24,
          justifyContent: "center",
        }}
      >
        <Text
          accessibilityRole="header"
          style={{ fontFamily: font.display, fontSize: 32, color: theme.ink }}
        >
          This screen is not in the app
        </Text>
        <Link href="/" asChild>
          <Pressable
            accessibilityRole="button"
            style={{ minHeight: 44, justifyContent: "center", marginTop: 16 }}
          >
            <Text style={{ color: theme.teal, fontFamily: font.strong, fontSize: 16 }}>
              Back to notices
            </Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}
