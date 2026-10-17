import { BID_STATUS_LABEL, formatRand } from "@tender/fixtures";
import { useEffect, useState } from "react";

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
import { loadMyBids, watchRegister, type LiveBid } from "@/src/queries";
import { useSession } from "@/src/session";

export default function BidsScreen() {
  const { session } = useSession();
  const [bids, setBids] = useState<LiveBid[]>([]);

  useEffect(() => {
    if (!session) return;
    const load = () => {
      void loadMyBids().then(setBids);
    };
    load();
    return watchRegister(load);
  }, [session]);

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
          you sign in.
        </SectionSub>
        <PrimaryButton label="Sign in" href="/sign-in" />
      </HomeFrame>
    );
  }

  return (
    <Page>
      <SectionTitle>Your bids</SectionTitle>
      <SectionSub>{session.company}</SectionSub>
      {bids.map((bid) => (
        <Row
          key={bid.id}
          href={`/tender/${bid.tenderId}`}
          title={bid.title}
          meta={`${BID_STATUS_LABEL[bid.status as keyof typeof BID_STATUS_LABEL] ?? bid.status}\n${formatRand(bid.amountCents)}`}
        />
      ))}
    </Page>
  );
}
