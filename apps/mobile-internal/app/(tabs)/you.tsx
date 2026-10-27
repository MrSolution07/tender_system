import { ROLE_LABEL } from "@tender/fixtures";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  ForestSub,
  ForestTitle,
  HomeFrame,
  QuietButton,
  SectionSub,
  SectionTitle,
  Wordmark,
} from "@/src/kit";
import { loadNotifications, markNotificationRead } from "@/src/operate";
import { useSession } from "@/src/session";

export default function YouScreen() {
  const { session, signOut } = useSession();
  const [notices, setNotices] = useState<{ id: string; title: string; body: string }[]>([]);

  useEffect(() => {
    if (!session) return;
    void loadNotifications().then(setNotices);
  }, [session]);

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
      <SectionTitle>Notices</SectionTitle>
      {notices.length === 0 ? <SectionSub>No notices yet.</SectionSub> : null}
      {notices.map((notice) => (
        <QuietButton
          key={notice.id}
          label={`${notice.title}. ${notice.body}`}
          onPress={() => {
            void markNotificationRead(notice.id).then(() => {
              void loadNotifications().then(setNotices);
            });
          }}
        />
      ))}
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
