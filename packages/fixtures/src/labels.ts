import type {
  AiReviewStatus,
  AppRole,
  BidStatus,
  ProjectStatus,
  TenderStatus,
} from "@tender/shared";

export const TENDER_STATUS_LABEL: Record<TenderStatus, string> = {
  draft: "Draft",
  published: "Published",
  closed: "Closed",
  evaluating: "Evaluating",
  awarded: "Awarded",
  completed: "Completed",
  archived: "Archived",
};

export const REVIEW_STATUS_LABEL: Record<AiReviewStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  needs_review: "Needs review",
  approved: "Approved",
  corrected: "Corrected",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  delayed: "Delayed",
  completed: "Completed",
};

export const BID_STATUS_LABEL: Record<BidStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  withdrawn: "Withdrawn",
  under_review: "Under review",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super admin",
  procurement_officer: "Procurement officer",
  evaluator: "Evaluator",
  contractor: "Contractor",
};

export const STATUS_ACTION: Record<TenderStatus, string> = {
  draft: "Return to draft",
  published: "Publish",
  closed: "Close",
  evaluating: "Start evaluation",
  awarded: "Record award",
  completed: "Mark completed",
  archived: "Archive",
};
