import type { TenderStatus } from "@tender/shared";

import { supabase } from "@/src/supabase";

export type DeskTender = {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  budgetCents: number;
  status: TenderStatus;
  closingAt: string | null;
  requirements: { id: string; body: string }[];
  documents: { id: string; fileName: string; path: string }[];
};

export type DeskReview = {
  id: string;
  tenderId: string;
  title: string;
  reviewStatus: string;
  summary: string;
  model: string;
};

export type DeskEvaluation = {
  id: string;
  tenderId: string;
  title: string;
  contractor: string;
  score: number | null;
  comments: string;
};

function rows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    : [];
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

const STATUSES = ["draft", "published", "closed", "evaluating", "awarded", "completed", "archived"] as const;

function statusOf(value: unknown): TenderStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value)
    ? (value as TenderStatus)
    : "draft";
}

let watchSeq = 0;

export function watchRegister(onChange: () => void): () => void {
  if (!supabase) return () => undefined;
  const client = supabase;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const refresh = () => {
    clearTimeout(timer);
    timer = setTimeout(onChange, 200);
  };
  const channel = client.channel(`desk-register-${(watchSeq += 1)}`);
  for (const table of ["tenders", "bids", "evaluations", "ai_analyses"]) {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
  }
  channel.subscribe();
  return () => {
    clearTimeout(timer);
    void client.removeChannel(channel);
  };
}

export async function loadTenders(): Promise<DeskTender[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("tenders")
    .select("id,title,description,category,department,budget_cents,status,closing_at,tender_requirements(id,body),tender_documents(id,file_name,storage_path)")
    .order("closing_at", { ascending: true });
  return rows(data).flatMap((row) => {
    if (typeof row.id !== "string") return [];
    return [{
      id: row.id,
      title: text(row.title),
      description: text(row.description),
      category: text(row.category),
      department: text(row.department),
      budgetCents: typeof row.budget_cents === "number" ? row.budget_cents : 0,
      status: statusOf(row.status),
      closingAt: typeof row.closing_at === "string" ? row.closing_at : null,
      requirements: rows(row.tender_requirements).flatMap((item) =>
        typeof item.id === "string" ? [{ id: item.id, body: text(item.body) }] : [],
      ),
      documents: rows(row.tender_documents).flatMap((item) =>
        typeof item.id === "string"
          ? [{ id: item.id, fileName: text(item.file_name), path: text(item.storage_path) }]
          : [],
      ),
    }];
  });
}

export async function loadReviews(): Promise<DeskReview[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("ai_analyses")
    .select("id,tender_id,review_status,summary,model,tenders(title)");
  return rows(data).flatMap((row) => {
    if (typeof row.id !== "string" || typeof row.tender_id !== "string") return [];
    const tender = one(row.tenders);
    return [{
      id: row.id,
      tenderId: row.tender_id,
      title: text(tender?.title, "Tender"),
      reviewStatus: text(row.review_status),
      summary: text(row.summary),
      model: text(row.model, "document-extractor"),
    }];
  });
}

export async function loadEvaluations(): Promise<DeskEvaluation[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("evaluations")
    .select("id,score,comments,bids(tender_id,tenders(title),contractors(company_name))");
  return rows(data).flatMap((row) => {
    if (typeof row.id !== "string") return [];
    const bid = one(row.bids);
    const tender = one(bid?.tenders);
    const contractor = one(bid?.contractors);
    if (!bid || typeof bid.tender_id !== "string") return [];
    return [{
      id: row.id,
      tenderId: bid.tender_id,
      title: text(tender?.title, "Tender"),
      contractor: text(contractor?.company_name, "Contractor"),
      score: typeof row.score === "number" ? row.score : null,
      comments: text(row.comments),
    }];
  });
}

export async function saveDraft(input: {
  title: string;
  department: string;
  category: string;
  description: string;
  budgetCents: number;
  closingAt: string;
}): Promise<string | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data, error } = await supabase
    .from("tenders")
    .insert({
      title: input.title,
      department: input.department,
      category: input.category,
      description: input.description,
      budget_cents: input.budgetCents,
      closing_at: input.closingAt,
      created_by: userData.user.id,
      status: "draft",
    })
    .select("id")
    .single();
  if (error || !data || typeof data.id !== "string") return null;
  return data.id;
}

export async function setTenderStatus(id: string, status: TenderStatus): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("tenders").update({ status }).eq("id", id);
  return !error;
}

export async function setReviewStatus(id: string, status: "approved" | "corrected"): Promise<boolean> {
  if (!supabase) return false;
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("ai_analyses")
    .update({
      review_status: status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userData.user?.id ?? null,
    })
    .eq("id", id);
  return !error;
}

export async function saveScore(id: string, score: number, comments: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("evaluations")
    .update({ score, comments, compliance_pass: score >= 50 })
    .eq("id", id);
  return !error;
}
