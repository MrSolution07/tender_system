import type {
  AiReviewStatus,
  AppRole,
  ProjectStatus,
  TenderDocumentKind,
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

export const DOCUMENT_KIND_LABEL: Record<TenderDocumentKind, string> = {
  specification: "Specification",
  addendum: "Addendum",
  form: "Form",
  supporting: "Supporting",
};

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super admin",
  procurement_officer: "Procurement officer",
  evaluator: "Evaluator",
  contractor: "Contractor",
};
