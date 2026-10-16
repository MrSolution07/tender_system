import {
  ForestSub,
  ForestTitle,
  HomeFrame,
  PrimaryButton,
  QuietButton,
  SectionSub,
  SectionTitle,
  Wordmark,
} from "@/src/kit";
import { useSession } from "@/src/session";

export default function YouScreen() {
  const { session, signOut } = useSession();

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
          <ForestSub>{session.company}</ForestSub>
        </>
      }
    >
      <SectionTitle>Account</SectionTitle>
      <SectionSub>Bids you submit are stored on the register.</SectionSub>
      <QuietButton label="Sign out" onPress={() => void signOut()} />
    </HomeFrame>
  );
}
