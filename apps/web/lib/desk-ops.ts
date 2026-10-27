import {
  canTransition,
  hasExtractedLines,
  isTenderDocumentKind,
  MAX_FILE_BYTES,
  PROJECT_STATUSES,
  storageObjectName,
  type ExtractedSuggestion,
  type ProjectStatus,
  type TenderDocumentKind,
  type TenderStatus,
} from "@tender/shared";

import { createSupabase, hasSupabaseConfig } from "./supabase";

export type TenderBid = {
  id: string;
  contractor: string;
  amountCents: number;
  status: string;
  files: { id: string; fileName: string; path: string }[];
};

export type AwardState = {
  id: string;
  bidId: string;
  projectId: string | null;
  projectTitle: string;
  progress: number;
  status: ProjectStatus;
};

export type ScoreCard = {
  bidId: string;
  evaluationId: string | null;
  tenderId: string;
  title: string;
  contractor: string;
  score: number | null;
  comments: string;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

function client() {
  if (!hasSupabaseConfig()) return null;
  return createSupabase();
}

function failure(error: { message?: string } | null, fallback: string): string | null {
  if (!error) return null;
  const message = error.message?.trim();
  return message && message.length < 280 ? message : fallback;
}

function cents(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function one(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object" ? (first as Record<string, unknown>) : null;
  }
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function many(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
}

function scoreOf(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function projectStatus(value: unknown): ProjectStatus {
  return typeof value === "string" && (PROJECT_STATUSES as readonly string[]).includes(value)
    ? (value as ProjectStatus)
    : "not_started";
}

async function userId(): Promise<{ id: string } | { error: string }> {
  const supabase = client();
  if (!supabase) return { error: "The register is not configured." };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { error: "Sign in again." };
  return { id: data.user.id };
}

export async function signedTenderUrl(path: string): Promise<{ url: string | null; error: string | null }> {
  if (!path) return { url: null, error: "This file is listed but not stored yet." };
  const supabase = client();
  if (!supabase) return { url: null, error: "The register is not configured." };
  const { data, error } = await supabase.storage.from("tender-documents").createSignedUrl(path, 60);
  if (error || !data?.signedUrl) {
    const missing = !error || /not found|404/i.test(error.message);
    return { url: null, error: missing ? "This file is listed but not stored yet." : "File could not be opened." };
  }
  return { url: data.signedUrl, error: null };
}

export async function signedBidUrl(path: string): Promise<{ url: string | null; error: string | null }> {
  if (!path) return { url: null, error: "This file is listed but not stored yet." };
  const supabase = client();
  if (!supabase) return { url: null, error: "The register is not configured." };
  const { data, error } = await supabase.storage.from("bid-documents").createSignedUrl(path, 60);
  if (error || !data?.signedUrl) {
    return { url: null, error: "This file is listed but not stored yet." };
  }
  return { url: data.signedUrl, error: null };
}

export async function uploadTenderFile(
  tenderId: string,
  file: File,
  kind: TenderDocumentKind,
): Promise<string | null> {
  if (!isTenderDocumentKind(kind)) return "Choose a document kind.";
  if (file.size <= 0) return "Choose a file.";
  if (file.size > MAX_FILE_BYTES) return "Files must be 50 MB or smaller.";
  const supabase = client();
  if (!supabase) return "The register is not configured.";
  const actor = await userId();
  if ("error" in actor) return actor.error;

  const { data: existing, error: versionError } = await supabase
    .from("tender_documents")
    .select("version")
    .eq("tender_id", tenderId);
  if (versionError) return "Could not read the current file versions.";
  const version = (existing ?? []).reduce((max, row) => {
    const current = typeof row.version === "number" ? row.version : 0;
    return Math.max(max, current);
  }, 0) + 1;

  const path = storageObjectName(tenderId, file.name);
  const { error: uploadError } = await supabase.storage.from("tender-documents").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) return uploadError.message || "Could not store the file.";

  const { error: insertError } = await supabase.from("tender_documents").insert({
    tender_id: tenderId,
    uploaded_by: actor.id,
    kind,
    storage_path: path,
    file_name: file.name,
    mime_type: file.type || null,
    byte_size: file.size,
    version,
  });
  if (insertError) {
    return "The file was stored but could not be added to the tender. Upload it again.";
  }
  return null;
}

export async function addRequirement(
  tenderId: string,
  body: string,
  mandatory: boolean,
): Promise<string | null> {
  const textBody = body.trim();
  if (!textBody) return "Write the requirement.";
  const supabase = client();
  if (!supabase) return "The register is not configured.";
  const { error } = await supabase.from("tender_requirements").insert({
    tender_id: tenderId,
    body: textBody,
    mandatory,
    source: "human",
  });
  return failure(error, "Could not add the requirement.");
}

export async function addCriterion(tenderId: string, label: string, weight: number): Promise<string | null> {
  const textLabel = label.trim();
  if (!textLabel) return "Name the criterion.";
  if (!Number.isFinite(weight) || weight < 0 || weight > 100) return "Weight must be from 0 to 100.";
  const supabase = client();
  if (!supabase) return "The register is not configured.";
  const { error } = await supabase.from("evaluation_criteria").insert({
    tender_id: tenderId,
    label: textLabel,
    weight,
    source: "human",
  });
  return failure(error, "Could not add the criterion.");
}

export async function copyExtracted(
  tenderId: string,
  extracted: ExtractedSuggestion,
): Promise<string | null> {
  if (!hasExtractedLines(extracted)) return "This suggestion has no extracted lines to copy.";
  const supabase = client();
  if (!supabase) return "The register is not configured.";
  if (extracted.requirements.length > 0) {
    const { error } = await supabase.from("tender_requirements").insert(
      extracted.requirements.map((item, index) => ({
        tender_id: tenderId,
        body: item.body,
        mandatory: item.mandatory,
        source: "ai_approved",
        sort_order: index + 1,
      })),
    );
    if (error) return failure(error, "Could not copy the requirements.");
  }
  if (extracted.criteria.length > 0) {
    const { error } = await supabase.from("evaluation_criteria").insert(
      extracted.criteria.map((item, index) => ({
        tender_id: tenderId,
        label: item.label,
        weight: item.weight,
        source: "ai_approved",
        sort_order: index + 1,
      })),
    );
    if (error) return failure(error, "Could not copy the criteria.");
  }
  return null;
}

export async function loadCriteria(tenderId: string): Promise<{ label: string; weight: number }[]> {
  const supabase = client();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("evaluation_criteria")
    .select("label, weight, sort_order")
    .eq("tender_id", tenderId)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []).flatMap((row) => {
    const label = text(row.label);
    if (!label) return [];
    return [{ label, weight: cents(row.weight) }];
  });
}

export async function loadTenderBids(tenderId: string): Promise<{ bids: TenderBid[]; error: string | null }> {
  const supabase = client();
  if (!supabase) return { bids: [], error: "The register is not configured." };
  const { data, error } = await supabase
    .from("bids")
    .select("id, amount_cents, status, contractors(company_name), bid_documents(id, file_name, storage_path)")
    .eq("tender_id", tenderId)
    .order("created_at", { ascending: true });
  if (error) return { bids: [], error: "Bids could not be loaded." };
  const bids = many(data).flatMap((row): TenderBid[] => {
    if (typeof row.id !== "string") return [];
    const contractor = one(row.contractors);
    return [{
      id: row.id,
      contractor: text(contractor?.company_name, "Contractor"),
      amountCents: cents(row.amount_cents),
      status: text(row.status),
      files: many(row.bid_documents).flatMap((file) =>
        typeof file.id === "string"
          ? [{ id: file.id, fileName: text(file.file_name), path: text(file.storage_path) }]
          : [],
      ),
    }];
  });
  return { bids, error: null };
}

export async function loadEvaluators(): Promise<{ people: { id: string; name: string }[]; error: string | null }> {
  const supabase = client();
  if (!supabase) return { people: [], error: "The register is not configured." };
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "evaluator")
    .order("full_name", { ascending: true });
  if (error) return { people: [], error: "Evaluators could not be loaded." };
  return {
    people: (data ?? []).flatMap((row) =>
      typeof row.id === "string" ? [{ id: row.id, name: text(row.full_name, "Evaluator") }] : [],
    ),
    error: null,
  };
}

export async function loadAssignments(tenderId: string): Promise<string[]> {
  const supabase = client();
  if (!supabase) return [];
  const { data } = await supabase
    .from("evaluator_assignments")
    .select("evaluator_id")
    .eq("tender_id", tenderId);
  return (data ?? []).flatMap((row) => (typeof row.evaluator_id === "string" ? [row.evaluator_id] : []));
}

export async function assignEvaluator(tenderId: string, evaluatorId: string): Promise<string | null> {
  if (!evaluatorId) return "Choose an evaluator.";
  const supabase = client();
  if (!supabase) return "The register is not configured.";
  const actor = await userId();
  if ("error" in actor) return actor.error;
  const { error } = await supabase.from("evaluator_assignments").insert({
    tender_id: tenderId,
    evaluator_id: evaluatorId,
    assigned_by: actor.id,
  });
  if (!error) return null;
  if (/duplicate|unique/i.test(error.message)) return "Already assigned.";
  return failure(error, "Could not assign the evaluator.");
}

export async function loadAward(tenderId: string): Promise<AwardState | null> {
  const supabase = client();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("awards")
    .select("id, bid_id, projects(id, title, progress_percent, status)")
    .eq("tender_id", tenderId)
    .maybeSingle();
  if (error || !data || typeof data.id !== "string") return null;
  const project = one(data.projects);
  return {
    id: data.id,
    bidId: text(data.bid_id),
    projectId: typeof project?.id === "string" ? project.id : null,
    projectTitle: text(project?.title),
    progress: cents(project?.progress_percent),
    status: projectStatus(project?.status),
  };
}

export async function recordAward(input: {
  tenderId: string;
  bidId: string;
  title: string;
  status: TenderStatus;
}): Promise<string | null> {
  if (!input.bidId) return "Choose the winning bid.";
  if (input.status !== "evaluating" && input.status !== "awarded") {
    return "Record the award when the tender is in evaluation.";
  }
  const supabase = client();
  if (!supabase) return "The register is not configured.";
  const actor = await userId();
  if ("error" in actor) return actor.error;

  const { data: bid, error: bidError } = await supabase
    .from("bids")
    .select("id, tender_id, status")
    .eq("id", input.bidId)
    .maybeSingle();
  if (bidError || !bid || bid.tender_id !== input.tenderId) {
    return "That bid belongs to a different tender.";
  }
  if (bid.status !== "submitted" && bid.status !== "accepted") {
    return "Choose a submitted bid.";
  }

  let awardId: string | null = null;
  let projectId: string | null = null;
  const { data: existing } = await supabase
    .from("awards")
    .select("id, projects(id)")
    .eq("tender_id", input.tenderId)
    .maybeSingle();
  if (existing && typeof existing.id === "string") {
    awardId = existing.id;
    const project = one(existing.projects);
    projectId = typeof project?.id === "string" ? project.id : null;
  } else {
    const { data: created, error } = await supabase
      .from("awards")
      .insert({
        tender_id: input.tenderId,
        bid_id: input.bidId,
        awarded_by: actor.id,
      })
      .select("id")
      .single();
    if (error || !created || typeof created.id !== "string") {
      return failure(error, "Could not record the award.");
    }
    awardId = created.id;
  }

  if (!projectId && awardId) {
    const { error } = await supabase.from("projects").insert({
      award_id: awardId,
      title: input.title.trim() || "Awarded project",
      progress_percent: 0,
      status: "not_started",
    });
    if (error) return failure(error, "The award was saved but the project was not.");
  }

  if (input.status === "evaluating" && canTransition(input.status, "awarded")) {
    const { error } = await supabase.from("tenders").update({ status: "awarded" }).eq("id", input.tenderId);
    if (error) return failure(error, "The award was saved but the tender status was not changed.");
  }
  return null;
}

export async function updateProject(
  projectId: string,
  progress: number,
  status: ProjectStatus,
): Promise<string | null> {
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    return "Progress must be a whole number from 0 to 100.";
  }
  const supabase = client();
  if (!supabase) return "The register is not configured.";
  const { error } = await supabase
    .from("projects")
    .update({ progress_percent: progress, status })
    .eq("id", projectId);
  return failure(error, "Could not update the project.");
}

export async function addSpend(
  projectId: string,
  amountCents: number,
  spentOn: string,
  description: string,
): Promise<string | null> {
  if (!Number.isInteger(amountCents) || amountCents < 0) return "Enter a spend amount of zero or more.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(spentOn)) return "Enter the date as YYYY-MM-DD.";
  const supabase = client();
  if (!supabase) return "The register is not configured.";
  const actor = await userId();
  if ("error" in actor) return actor.error;
  const { error } = await supabase.from("expenditure").insert({
    project_id: projectId,
    amount_cents: amountCents,
    spent_on: spentOn,
    description: description.trim() || null,
    created_by: actor.id,
  });
  return failure(error, "Could not add the spend line.");
}

export async function loadNotifications(): Promise<{ items: Notice[]; error: string | null }> {
  const supabase = client();
  if (!supabase) return { items: [], error: "The register is not configured." };
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return { items: [], error: "Notices could not be loaded." };
  return {
    items: (data ?? []).flatMap((row) =>
      typeof row.id === "string"
        ? [{
            id: row.id,
            title: text(row.title),
            body: text(row.body),
            readAt: typeof row.read_at === "string" ? row.read_at : null,
            createdAt: text(row.created_at),
          }]
        : [],
    ),
    error: null,
  };
}

export async function markNotificationRead(id: string): Promise<string | null> {
  const supabase = client();
  if (!supabase) return "The register is not configured.";
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  return failure(error, "Could not mark the notice as read.");
}

export async function loadScoreBoard(): Promise<{ cards: ScoreCard[]; error: string | null }> {
  const supabase = client();
  if (!supabase) return { cards: [], error: "The register is not configured." };
  const actor = await userId();
  if ("error" in actor) return { cards: [], error: actor.error };

  const { data: evaluations, error: evaluationError } = await supabase
    .from("evaluations")
    .select("id, bid_id, score, comments, bids(tender_id, tenders(title), contractors(company_name))");
  if (evaluationError) return { cards: [], error: "Scores could not be loaded." };

  const cards = new Map<string, ScoreCard>();
  for (const row of evaluations ?? []) {
    if (typeof row.id !== "string" || typeof row.bid_id !== "string") continue;
    const bid = one(row.bids);
    const tender = one(bid?.tenders);
    const contractor = one(bid?.contractors);
    const tenderId = text(bid?.tender_id);
    if (!tenderId) continue;
    cards.set(row.bid_id, {
      bidId: row.bid_id,
      evaluationId: row.id,
      tenderId,
      title: text(tender?.title, "Tender"),
      contractor: text(contractor?.company_name, "Contractor"),
      score: scoreOf(row.score),
      comments: text(row.comments),
    });
  }

  const { data: assignments, error: assignmentError } = await supabase
    .from("evaluator_assignments")
    .select("tender_id")
    .eq("evaluator_id", actor.id);
  if (assignmentError) return { cards: [...cards.values()], error: null };
  const tenderIds = (assignments ?? []).flatMap((row) =>
    typeof row.tender_id === "string" ? [row.tender_id] : [],
  );
  if (tenderIds.length === 0) return { cards: [...cards.values()], error: null };

  const { data: bids, error: bidError } = await supabase
    .from("bids")
    .select("id, tender_id, status, tenders(title), contractors(company_name)")
    .in("tender_id", tenderIds)
    .in("status", ["submitted", "accepted", "under_review"]);
  if (bidError) return { cards: [...cards.values()], error: null };
  for (const row of bids ?? []) {
    if (typeof row.id !== "string" || cards.has(row.id)) continue;
    const tender = one(row.tenders);
    const contractor = one(row.contractors);
    cards.set(row.id, {
      bidId: row.id,
      evaluationId: null,
      tenderId: text(row.tender_id),
      title: text(tender?.title, "Tender"),
      contractor: text(contractor?.company_name, "Contractor"),
      score: null,
      comments: "",
    });
  }
  return { cards: [...cards.values()], error: null };
}

export async function saveScoreForBid(
  bidId: string,
  score: number,
  comments: string,
): Promise<string | null> {
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    return "Enter a whole score from 0 to 100.";
  }
  const supabase = client();
  if (!supabase) return "The register is not configured.";
  const actor = await userId();
  if ("error" in actor) return actor.error;
  const { error } = await supabase.from("evaluations").upsert(
    {
      bid_id: bidId,
      evaluator_id: actor.id,
      score,
      comments: comments.trim(),
      compliance_pass: score >= 50,
    },
    { onConflict: "bid_id,evaluator_id" },
  );
  return failure(error, "Could not save the score.");
}
