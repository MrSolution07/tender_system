import type { AiReviewStatus, AppRole, ProjectStatus, TenderStatus } from "@tender/shared";

export type DeskRole = Exclude<AppRole, "contractor">;

export type TenderRecord = {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  budgetCents: number;
  status: TenderStatus;
  publishedAt: string | null;
  closingAt: string | null;
  requirements: { id: string; body: string; mandatory: boolean }[];
  documents: { id: string; fileName: string }[];
};

export type ReviewRecord = {
  id: string;
  tenderId: string;
  reviewStatus: AiReviewStatus;
  summary: string;
  model: string;
};

export type AwardRecord = {
  id: string;
  tenderId: string;
  contractor: string;
  awardedAt: string;
  projectTitle: string;
  projectStatus: ProjectStatus;
  progressPercent: number;
  locationLabel: string;
  spend: { id: string; label: string; amountCents: number }[];
};

export type EvaluationRecord = {
  id: string;
  tenderId: string;
  contractor: string;
  score: number | null;
  comments: string;
  compliancePass: boolean | null;
};

export type DeskSession = {
  role: DeskRole;
  name: string;
};

export const EMPTY_CATEGORY = "Harbour works";
