import {
  REVIEW_STATUS_LABEL,
  sampleReviews,
  tenderById,
} from "@tender/fixtures";

import { Body, Page, Row, SectionTitle } from "@/src/kit";

export default function ReviewsScreen() {
  return (
    <Page>
      <SectionTitle>Suggestions</SectionTitle>
      <Body>
        Model text stays suggested until a person reviews it. Approving here
        does not change a tender.
      </Body>
      {sampleReviews.map((review) => {
        const tender = tenderById(review.tenderId);
        return (
          <Row
            key={review.id}
            href={`/review/${review.id}`}
            title={tender?.title ?? "Tender"}
            meta={REVIEW_STATUS_LABEL[review.reviewStatus]}
          />
        );
      })}
    </Page>
  );
}
