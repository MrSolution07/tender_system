import { REVIEW_STATUS_LABEL } from "@tender/fixtures";
import type { AiReviewStatus } from "@tender/shared";
import { useEffect, useState } from "react";

import { Body, Page, Row, SectionTitle } from "@/src/kit";
import { loadReviews, watchRegister, type DeskReview } from "@/src/queries";

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState<DeskReview[]>([]);
  useEffect(() => {
    const load = () => {
      void loadReviews().then(setReviews);
    };
    load();
    return watchRegister(load);
  }, []);

  return (
    <Page>
      <SectionTitle>Suggestions</SectionTitle>
      <Body>
        Model text stays suggested until a person reviews it. Approving here
        does not change a tender.
      </Body>
      {reviews.map((review) => (
        <Row
          key={review.id}
          href={`/review/${review.id}`}
          title={review.title}
          meta={REVIEW_STATUS_LABEL[review.reviewStatus as AiReviewStatus] ?? review.reviewStatus}
        />
      ))}
    </Page>
  );
}
