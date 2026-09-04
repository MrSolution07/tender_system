export const TENDER_STATUSES = [
  "draft",
  "published",
  "closed",
  "evaluating",
  "awarded",
  "completed",
  "archived",
] as const;

export type TenderStatus = (typeof TENDER_STATUSES)[number];

export const TENDER_TRANSITIONS: Record<TenderStatus, readonly TenderStatus[]> = {
  draft: ["published", "archived"],
  published: ["closed", "archived"],
  closed: ["evaluating", "archived"],
  evaluating: ["awarded", "archived"],
  awarded: ["completed", "archived"],
  completed: ["archived"],
  archived: [],
};

export function canTransition(from: TenderStatus, to: TenderStatus): boolean {
  return TENDER_TRANSITIONS[from].includes(to);
}

export const BID_STATUSES = [
  "draft",
  "submitted",
  "withdrawn",
  "under_review",
  "accepted",
  "rejected",
] as const;

export type BidStatus = (typeof BID_STATUSES)[number];

export const AI_REVIEW_STATUSES = [
  "pending",
  "processing",
  "needs_review",
  "approved",
  "corrected",
] as const;

export type AiReviewStatus = (typeof AI_REVIEW_STATUSES)[number];

export const PROJECT_STATUSES = [
  "not_started",
  "in_progress",
  "delayed",
  "completed",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
