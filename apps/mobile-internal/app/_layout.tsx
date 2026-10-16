import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, type ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { font, theme } from "@/src/kit";
import { SessionProvider, useSession } from "@/src/session";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SessionProvider>
        <Gate>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.canvas },
              headerTintColor: theme.forest,
              headerTitleStyle: {
                fontFamily: font.strong,
                color: theme.ink,
                fontSize: 17,
              },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: theme.canvas },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          </Stack>
        </Gate>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const segments = useSegments();
  const onSignIn = segments[0] === "sign-in";
  if (!session && !onSignIn) return <Redirect href="/sign-in" />;
  if (session && onSignIn) {
    return (
      <Redirect href={session.role === "evaluator" ? "/scores" : "/"} />
    );
  }
  return children;
}
