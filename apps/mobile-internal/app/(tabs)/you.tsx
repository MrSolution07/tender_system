import { DESK_PEOPLE, ROLE_LABEL, type DeskRole } from "@tender/fixtures";
import { router } from "expo-router";

import {
  Choice,
  ForestSub,
  ForestTitle,
  HomeFrame,
  QuietButton,
  SectionSub,
  SectionTitle,
  Wordmark,
} from "@/src/kit";
import { useSession } from "@/src/session";

const ROLES: DeskRole[] = [
  "procurement_officer",
  "evaluator",
  "super_admin",
];

export default function YouScreen() {
  const { session, enter, leave } = useSession();

  return (
    <HomeFrame
      header={
        <>
          <Wordmark />
          <ForestTitle>{session?.name ?? "Desk"}</ForestTitle>
          <ForestSub>
            {session
              ? `${ROLE_LABEL[session.role]}. Sample sign-in on this phone.`
              : "Pick a sample person to open the desk."}
          </ForestSub>
        </>
      }
    >
      <SectionTitle>Sample people</SectionTitle>
      <SectionSub>Switching person stays on this phone.</SectionSub>
      {ROLES.map((role) => (
        <Choice
          key={role}
          title={DESK_PEOPLE[role]}
          meta={
            session?.role === role
              ? `${ROLE_LABEL[role]}, signed in`
              : ROLE_LABEL[role]
          }
          onPress={() => {
            enter(role);
            router.replace(role === "evaluator" ? "/scores" : "/");
          }}
        />
      ))}
      <QuietButton
        label="Sign out"
        onPress={() => {
          leave();
        }}
      />
    </HomeFrame>
  );
}
