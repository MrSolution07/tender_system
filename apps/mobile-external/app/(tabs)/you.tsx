import {
  ForestSub,
  ForestTitle,
  HomeFrame,
  PrimaryButton,
  QuietButton,
  Row,
  SectionSub,
  SectionTitle,
  Wordmark,
} from "@/src/kit";
import { useSession } from "@/src/session";

export default function YouScreen() {
  const { session, leave } = useSession();

  if (!session) {
    return (
      <HomeFrame
        header={
          <>
            <Wordmark />
            <ForestTitle>Public record</ForestTitle>
            <ForestSub>
              Notices and awards stay open without a sign-in.
            </ForestSub>
          </>
        }
      >
        <SectionTitle>Contractor account</SectionTitle>
        <SectionSub>
          The sample sign-in unlocks bid rows for Umhlaba Civils.
        </SectionSub>
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
          <ForestSub>
            {session.company}. Sample account on this phone.
          </ForestSub>
        </>
      }
    >
      <SectionTitle>Compliance files</SectionTitle>
      <SectionSub>Listed only. This preview does not open the file.</SectionSub>
      <Row
        href={{
          pathname: "/document/[id]",
          params: { id: "cidb", name: "CIDB grading letter.pdf" },
        }}
        title="CIDB grading letter.pdf"
        meta="Listed only"
      />
      <Row
        href={{
          pathname: "/document/[id]",
          params: { id: "tax", name: "Tax clearance.pdf" },
        }}
        title="Tax clearance.pdf"
        meta="Listed only"
      />
      <QuietButton label="Sign out" onPress={leave} />
    </HomeFrame>
  );
}
