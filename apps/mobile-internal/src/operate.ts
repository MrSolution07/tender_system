import {
  canTransition,
  hasExtractedLines,
  isTenderDocumentKind,
  PROJECT_STATUSES,
  storageObjectName,
  type ExtractedSuggestion,
  type ProjectStatus,
  type TenderDocumentKind,
  type TenderStatus,
} from "@tender/shared";

import type { PickedFile } from "@/src/files";
import { supabase } from "@/src/supabase";

export type TenderBid = {
  id: string;
  contractor: string;
  amountCents: number;
  status: string;
  files: { id: string; fileName: string; path: string }[];
};

export type ScoreCard = {
  bidId: string;
  title: string;
  contractor: string;
  score: number | null;
  comments: string;
};

function failure(error: { message?: string } | null, fallback: string): string | null {
  if (!error) return null;
  const message = error.message?.trim();
  return message && message.length < 280 ? message : fallback;
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

function cents(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

async function actorId(): Promise<{ id: string } | { error: string }> {
  if (!supabase) return { error: "The register is not configured." };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { error: "Sign in again." };
  return { id: data.user.id };
}

export async function openTenderFile(path: string): Promise<{ url: string | null; error: string | null }> {
  if (!supabase || !path) return { url: null, error: "This file is listed but not stored yet." };
  const { data, error } = await supabase.storage.from("tender-documents").createSignedUrl(path, 60);
  if (error || !data?.signedUrl) {
    const missing = !error || /not found|404/i.test(error.message);
    return { url: null, error: missing ? "This file is listed but not stored yet." : "File could not be opened." };
  }
  return { url: data.signedUrl, error: null };
}

export async function uploadTenderFile(
  tenderId: string,
  file: PickedFile,
  kind: TenderDocumentKind,
): Promise<string | null> {
  if (!supabase) return "The register is not configured.";
  if (!isTenderDocumentKind(kind)) return "Choose a document kind.";
  const actor = await actorId();
  if ("error" in actor) return actor.error;
  const { data: existing, error: versionError } = await supabase
    .from("tender_documents")
    .select("version")
    .eq("tender_id", tenderId);
  if (versionError) return "Could not read the current file versions.";
  const version = (existing ?? []).reduce((max, row) => Math.max(max, typeof row.version === "number" ? row.version : 0), 0) + 1;
  const path = storageObjectName(tenderId, file.name);
  const { error: uploadError } = await supabase.storage.from("tender-documents").upload(path, file.bytes, {
    contentType: file.mimeType,
    upsert: false,
  });
  if (uploadError) return uploadError.message || "Could not store the file.";
  const { error } = await supabase.from("tender_documents").insert({
    tender_id: tenderId,
    uploaded_by: actor.id,
    kind,
    storage_path: path,
    file_name: file.name,
    mime_type: file.mimeType,
    byte_size: file.size,
    version,
  });
  if (error) return "The file was stored but could not be added to the tender. Upload it again.";
  return null;
}

export async function addRequirement(tenderId: string, body: string): Promise<string | null> {
  if (!supabase) return "The register is not configured.";
  const textBody = body.trim();
  if (!textBody) return "Write the requirement.";
  const { error } = await supabase.from("tender_requirements").insert({
    tender_id: tenderId,
    body: textBody,
    mandatory: true,
    source: "human",
  });
  return failure(error, "Could not add the requirement.");
}

export async function addCriterion(tenderId: string, label: string, weight: number): Promise<string | null> {
  if (!supabase) return "The register is not configured.";
  const textLabel = label.trim();
  if (!textLabel) return "Name the criterion.";
  if (!Number.isFinite(weight) || weight < 0 || weight > 100) return "Weight must be from 0 to 100.";
  const { error } = await supabase.from("evaluation_criteria").insert({
    tender_id: tenderId,
    label: textLabel,
    weight,
    source: "human",
  });
  return failure(error, "Could not add the criterion.");
}

export async function copyExtracted(tenderId: string, extracted: ExtractedSuggestion): Promise<string | null> {
  if (!supabase) return "The register is not configured.";
  if (!hasExtractedLines(extracted)) return "This suggestion has no extracted lines to copy.";
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
  return null;
}

export async function loadTenderBids(tenderId: string): Promise<TenderBid[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("bids")
    .select("id, amount_cents, status, contractors(company_name), bid_documents(id, file_name, storage_path)")
    .eq("tender_id", tenderId);
  return (data ?? []).flatMap((row) => {
    if (typeof row.id !== "string") return [];
    const contractor = one(row.contractors);
    const documents = Array.isArray(row.bid_documents) ? row.bid_documents : [];
    return [{
      id: row.id,
      contractor: text(contractor?.company_name, "Contractor"),
      amountCents: cents(row.amount_cents),
      status: text(row.status),
      files: documents.flatMap((file) => {
        if (!file || typeof file !== "object") return [];
        const rowFile = file as Record<string, unknown>;
        if (typeof rowFile.id !== "string") return [];
        return [{ id: rowFile.id, fileName: text(rowFile.file_name), path: text(rowFile.storage_path) }];
      }),
    }];
  });
}

export async function openBidFile(path: string): Promise<{ url: string | null; error: string | null }> {
  if (!supabase || !path) return { url: null, error: "This file is listed but not stored yet." };
  const { data, error } = await supabase.storage.from("bid-documents").createSignedUrl(path, 60);
  if (error || !data?.signedUrl) return { url: null, error: "This file is listed but not stored yet." };
  return { url: data.signedUrl, error: null };
}

export async function tenderHasAward(tenderId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.from("awards").select("id").eq("tender_id", tenderId).maybeSingle();
  return Boolean(data && typeof data.id === "string");
}

export async function loadEvaluators(): Promise<{ id: string; name: string }[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("profiles").select("id, full_name").eq("role", "evaluator").order("full_name");
  return (data ?? []).flatMap((row) =>
    typeof row.id === "string" ? [{ id: row.id, name: text(row.full_name, "Evaluator") }] : [],
  );
}

export async function assignEvaluator(tenderId: string, evaluatorId: string): Promise<string | null> {
  if (!supabase) return "The register is not configured.";
  if (!evaluatorId) return "Choose an evaluator.";
  const actor = await actorId();
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

export async function recordAward(input: {
  tenderId: string;
  bidId: string;
  title: string;
  status: TenderStatus;
}): Promise<string | null> {
  if (!supabase) return "The register is not configured.";
  if (!input.bidId) return "Choose the winning bid.";
  if (input.status !== "evaluating" && input.status !== "awarded") {
    return "Record the award when the tender is in evaluation.";
  }
  const actor = await actorId();
  if ("error" in actor) return actor.error;
  const { data: bid } = await supabase.from("bids").select("id, tender_id, status").eq("id", input.bidId).maybeSingle();
  if (!bid || bid.tender_id !== input.tenderId) return "That bid belongs to a different tender.";
  if (bid.status !== "submitted" && bid.status !== "accepted") return "Choose a submitted bid.";

  const { data: existing } = await supabase
    .from("awards")
    .select("id, projects(id)")
    .eq("tender_id", input.tenderId)
    .maybeSingle();
  let awardId = existing && typeof existing.id === "string" ? existing.id : null;
  const project = one(existing?.projects);
  const hasProject = typeof project?.id === "string";
  if (!awardId) {
    const { data: created, error } = await supabase
      .from("awards")
      .insert({ tender_id: input.tenderId, bid_id: input.bidId, awarded_by: actor.id })
      .select("id")
      .single();
    if (error || !created || typeof created.id !== "string") return failure(error, "Could not record the award.");
    awardId = created.id;
  }
  if (!hasProject) {
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

export async function loadScoreBoard(): Promise<ScoreCard[]> {
  if (!supabase) return [];
  const actor = await actorId();
  if ("error" in actor) return [];
  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("id, bid_id, score, comments, bids(tender_id, tenders(title), contractors(company_name))");
  const cards = new Map<string, ScoreCard>();
  for (const row of evaluations ?? []) {
    if (typeof row.bid_id !== "string") continue;
    const bid = one(row.bids);
    const tender = one(bid?.tenders);
    const contractor = one(bid?.contractors);
    cards.set(row.bid_id, {
      bidId: row.bid_id,
      title: text(tender?.title, "Tender"),
      contractor: text(contractor?.company_name, "Contractor"),
      score: typeof row.score === "number" ? row.score : row.score === null ? null : cents(row.score),
      comments: text(row.comments),
    });
  }
  const { data: assignments } = await supabase
    .from("evaluator_assignments")
    .select("tender_id")
    .eq("evaluator_id", actor.id);
  const tenderIds = (assignments ?? []).flatMap((row) => (typeof row.tender_id === "string" ? [row.tender_id] : []));
  if (tenderIds.length === 0) return [...cards.values()];
  const { data: bids } = await supabase
    .from("bids")
    .select("id, tenders(title), contractors(company_name)")
    .in("tender_id", tenderIds)
    .in("status", ["submitted", "accepted", "under_review"]);
  for (const row of bids ?? []) {
    if (typeof row.id !== "string" || cards.has(row.id)) continue;
    const tender = one(row.tenders);
    const contractor = one(row.contractors);
    cards.set(row.id, {
      bidId: row.id,
      title: text(tender?.title, "Tender"),
      contractor: text(contractor?.company_name, "Contractor"),
      score: null,
      comments: "",
    });
  }
  return [...cards.values()];
}

export async function saveScoreForBid(bidId: string, score: number, comments: string): Promise<string | null> {
  if (!supabase) return "The register is not configured.";
  if (!Number.isInteger(score) || score < 0 || score > 100) return "Enter a whole score from 0 to 100.";
  const actor = await actorId();
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

export async function loadNotifications(): Promise<{ id: string; title: string; body: string }[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("notifications")
    .select("id, title, body")
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []).flatMap((row) =>
    typeof row.id === "string" ? [{ id: row.id, title: text(row.title), body: text(row.body) }] : [],
  );
}

export async function markNotificationRead(id: string): Promise<string | null> {
  if (!supabase) return "The register is not configured.";
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  return failure(error, "Could not mark the notice as read.");
}

export function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(value);
}
