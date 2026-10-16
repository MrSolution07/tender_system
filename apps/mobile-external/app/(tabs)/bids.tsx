import {
  BID_STATUS_LABEL,
  formatRand,
  sampleBids,
  tenderById,
} from "@tender/fixtures";

import {
  ForestSub,
  ForestTitle,
  HomeFrame,
  Page,
  PrimaryButton,
  Row,
  SectionSub,
  SectionTitle,
  Wordmark,
} from "@/src/kit";
import { useSession } from "@/src/session";

export default function BidsScreen() {
  const { session } = useSession();

  if (!session) {
    return (
      <HomeFrame
        header={
          <>
            <Wordmark />
            <ForestTitle>Bids</ForestTitle>
            <ForestSub>Amounts stay with the contractor account.</ForestSub>
          </>
        }
      >
        <SectionTitle>Sign in</SectionTitle>
        <SectionSub>
          Open notices can be read without an account. Bid rows appear after
          the sample sign-in.
        </SectionSub>
        <PrimaryButton label="Sign in" href="/sign-in" />
      </HomeFrame>
    );
  }

  const mine = sampleBids.filter((bid) => bid.contractor === session.company);

  return (
    <Page>
      <SectionTitle>Your bids</SectionTitle>
      <SectionSub>
        {session.company}. Sample bids. Sending a bid does not leave this phone.
      </SectionSub>
      {mine.map((bid) => {
        const tender = tenderById(bid.tenderId);
        return (
          <Row
            key={bid.id}
            href={`/tender/${bid.tenderId}`}
            title={tender?.title ?? "Tender"}
            meta={`${BID_STATUS_LABEL[bid.status]}\n${formatRand(bid.amountCents)}`}
          />
        );
      })}
    </Page>
  );
}
