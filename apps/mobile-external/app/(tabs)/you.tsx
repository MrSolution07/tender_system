import { useEffect, useState } from "react";

import {
  ForestSub,
  ForestTitle,
  HomeFrame,
  Field,
  FormError,
  PrimaryButton,
  QuietButton,
  SectionSub,
  SectionTitle,
  Wordmark,
} from "@/src/kit";
import { loadCompany, loadNotifications, updateCompany } from "@/src/queries";
import { useSession } from "@/src/session";

export default function YouScreen() {
  const { session, signOut, refresh } = useSession();
  const [company, setCompany] = useState("");
  const [registration, setRegistration] = useState("");
  const [hasCompany, setHasCompany] = useState(false);
  const [message, setMessage] = useState("");
  const [notices, setNotices] = useState<{ id: string; title: string; body: string }[]>([]);

  useEffect(() => {
    if (!session) return;
    void loadCompany().then((row) => {
      setHasCompany(Boolean(row));
      setCompany(row?.name ?? "");
      setRegistration(row?.registration ?? "");
    });
    void loadNotifications().then(setNotices);
  }, [session]);

  if (!session) {
    return (
      <HomeFrame
        header={
          <>
            <Wordmark />
            <ForestTitle>Public record</ForestTitle>
            <ForestSub>Notices and awards stay open without a sign-in.</ForestSub>
          </>
        }
      >
        <SectionTitle>Contractor account</SectionTitle>
        <SectionSub>Sign in to submit a bid and see your bid rows.</SectionSub>
        <PrimaryButton label="Sign in" href="/sign-in" />
      </HomeFrame>
    );
  }

  return (
    <HomeFrame
      header={
        <>
          <Wordmark />
          <ForestTitle>{session.name}</ForestTitle>
          <ForestSub>{session.company || "Company not on the account yet."}</ForestSub>
        </>
      }
    >
      <SectionTitle>Company</SectionTitle>
      {hasCompany ? (
        <>
          <Field label="Company name" value={company} onChangeText={setCompany} />
          <Field label="Registration number" value={registration} onChangeText={setRegistration} />
          <PrimaryButton
            label="Save company"
            onPress={() => {
              void updateCompany(company, registration).then(async (error) => {
                setMessage(error ?? "");
                if (!error) await refresh();
              });
            }}
          />
        </>
      ) : (
        <SectionSub>Ask an administrator to finish this account.</SectionSub>
      )}
      {message ? <FormError>{message}</FormError> : null}
      <SectionTitle>Notices</SectionTitle>
      {notices.length === 0 ? <SectionSub>No notices yet.</SectionSub> : null}
      {notices.map((notice) => (
        <SectionSub key={notice.id}>
          {notice.title}. {notice.body}
        </SectionSub>
      ))}
      <SectionTitle>Account</SectionTitle>
      <SectionSub>Bids you submit are stored on the register.</SectionSub>
      <QuietButton label="Sign out" onPress={() => void signOut()} />
    </HomeFrame>
  );
}
