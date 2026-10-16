import { sampleEvaluations, tenderById } from "@tender/fixtures";

import { Body, Page, Row, SectionTitle } from "@/src/kit";

export default function ScoresScreen() {
  return (
    <Page>
      <SectionTitle>Scores</SectionTitle>
      <Body>Assigned bids only. Scores stay off the public record.</Body>
      {sampleEvaluations.map((item) => {
        const tender = tenderById(item.tenderId);
        return (
          <Row
            key={item.id}
            href={`/score/${item.id}`}
            title={item.contractor}
            meta={tender?.title ?? "Tender"}
            aside={item.score === null ? "Unscored" : String(item.score)}
          />
        );
      })}
    </Page>
  );
}
