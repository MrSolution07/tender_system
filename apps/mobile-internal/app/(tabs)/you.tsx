import { ROLE_LABEL } from "@tender/fixtures";
import { router } from "expo-router";

import {
  ForestSub,
  ForestTitle,
  HomeFrame,
  QuietButton,
  SectionSub,
  SectionTitle,
  Wordmark,
} from "@/src/kit";
import { useSession } from "@/src/session";

export default function YouScreen() {
  const { session, signOut } = useSession();

  return (
    <HomeFrame
      header={
        <>
          <Wordmark />
          <ForestTitle>{session?.name ?? "Desk"}</ForestTitle>
          <ForestSub>
            {session ? ROLE_LABEL[session.role] : "Sign in to open the desk."}
          </ForestSub>
        </>
      }
    >
      <SectionTitle>Account</SectionTitle>
      <SectionSub>Your role comes from the account on the register.</SectionSub>
      <QuietButton
        label="Sign out"
        onPress={() => {
          void signOut().then(() => router.replace("/sign-in"));
        }}
      />
    </HomeFrame>
  );
}
