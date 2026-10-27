import { storageObjectName } from "@tender/shared";

import type { PickedFile } from "@/src/files";
import { supabase } from "@/src/supabase";

export type LiveTender = {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  budgetCents: number;
  status: string;
  closingAt: string | null;
  requirements: { id: string; body: string }[];
  documents: { id: string; fileName: string; path: string }[];
};

export type LiveAward = {
  id: string;
  projectTitle: string;
  contractor: string;
  awardedAt: string;
  projectStatus: string;
  progressPercent: number;
  locationLabel: string;
  spend: { id: string; label: string; amountCents: number }[];
};

export type LiveBid = {
  id: string;
  tenderId: string;
  title: string;
  status: string;
  amountCents: number;
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

export async function loadPublishedTenders(): Promise<LiveTender[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("tenders")
    .select("id,title,description,category,department,budget_cents,status,closing_at,tender_requirements(id,body),tender_documents(id,file_name,storage_path)")
    .eq("status", "published")
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
      status: text(row.status),
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

export async function loadTender(id: string): Promise<LiveTender | null> {
  const tenders = await loadPublishedTenders();
  return tenders.find((tender) => tender.id === id) ?? null;
}

export async function loadAwards(): Promise<LiveAward[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("awards")
    .select("id,awarded_at,contractors(company_name),projects(title,status,progress_percent,location_label,expenditure(id,description,amount_cents))")
    .order("awarded_at", { ascending: false });
  return rows(data).flatMap((row) => {
    if (typeof row.id !== "string") return [];
    const contractor = one(row.contractors);
    const project = one(row.projects);
    return [{
      id: row.id,
      projectTitle: text(project?.title, "Award"),
      contractor: text(contractor?.company_name),
      awardedAt: text(row.awarded_at),
      projectStatus: text(project?.status, "not_started"),
      progressPercent: typeof project?.progress_percent === "number" ? project.progress_percent : 0,
      locationLabel: text(project?.location_label),
      spend: rows(project?.expenditure).flatMap((line) =>
        typeof line.id === "string"
          ? [{ id: line.id, label: text(line.description, "Spend"), amountCents: typeof line.amount_cents === "number" ? line.amount_cents : 0 }]
          : [],
      ),
    }];
  });
}

export async function loadMyBids(): Promise<LiveBid[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("bids")
    .select("id,tender_id,status,amount_cents,tenders(title)")
    .order("created_at", { ascending: false });
  return rows(data).flatMap((row) => {
    if (typeof row.id !== "string" || typeof row.tender_id !== "string") return [];
    const tender = one(row.tenders);
    return [{
      id: row.id,
      tenderId: row.tender_id,
      title: text(tender?.title, "Tender"),
      status: text(row.status),
      amountCents: typeof row.amount_cents === "number" ? row.amount_cents : 0,
    }];
  });
}

export async function submitBid(
  tenderId: string,
  amountCents: number,
  note: string,
  files: PickedFile[],
  responses: { requirementId: string; response: string }[],
): Promise<{ error: string | null; filesStored: boolean }> {
  if (!supabase) return { error: "The register is not configured.", filesStored: false };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Sign in to submit a bid.", filesStored: false };
  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("profile_id", userData.user.id)
    .maybeSingle();
  if (!contractor || typeof contractor.id !== "string") {
    return { error: "Ask an administrator to finish this account.", filesStored: false };
  }

  const { data: existing, error: existingError } = await supabase
    .from("bids")
    .select("id, status")
    .eq("tender_id", tenderId)
    .eq("contractor_id", contractor.id)
    .maybeSingle();
  if (existingError) return { error: "This notice is not open for a bid.", filesStored: false };
  if (existing && existing.status !== "draft") {
    return { error: "This bid has already been submitted.", filesStored: false };
  }

  let bidId = existing && typeof existing.id === "string" ? existing.id : null;
  if (!bidId) {
    const { data: created, error } = await supabase
      .from("bids")
      .insert({
        tender_id: tenderId,
        contractor_id: contractor.id,
        amount_cents: amountCents,
        note,
        status: "draft",
      })
      .select("id")
      .single();
    if (error || !created || typeof created.id !== "string") {
      if (error && /duplicate|unique/i.test(error.message)) {
        return { error: "This bid has already been submitted.", filesStored: false };
      }
      return { error: error?.message || "This notice is not open for a bid.", filesStored: false };
    }
    bidId = created.id;
  } else {
    const { error } = await supabase
      .from("bids")
      .update({ amount_cents: amountCents, note })
      .eq("id", bidId);
    if (error) return { error: error.message || "Could not save the draft bid.", filesStored: false };
  }

  for (const file of files) {
    const path = storageObjectName(bidId, file.name);
    const { error: uploadError } = await supabase.storage.from("bid-documents").upload(path, file.bytes, {
      contentType: file.mimeType,
      upsert: false,
    });
    if (uploadError) return { error: uploadError.message || "Could not store an attachment.", filesStored: false };
    const { error } = await supabase.from("bid_documents").insert({
      bid_id: bidId,
      storage_path: path,
      file_name: file.name,
      mime_type: file.mimeType,
    });
    if (error) return { error: "An attachment was stored but could not be added to the bid.", filesStored: true };
  }

  const filled = responses.filter((item) => item.response.trim());
  if (filled.length > 0) {
    const { error } = await supabase.from("bid_requirement_responses").upsert(
      filled.map((item) => ({
        bid_id: bidId,
        requirement_id: item.requirementId,
        response: item.response.trim(),
      })),
      { onConflict: "bid_id,requirement_id" },
    );
    if (error) return { error: error.message || "Could not save the requirement responses.", filesStored: true };
  }

  const { error: submitError } = await supabase
    .from("bids")
    .update({ status: "submitted", amount_cents: amountCents, note })
    .eq("id", bidId);
  if (submitError) return { error: submitError.message || "This notice is not open for a bid.", filesStored: true };
  return { error: null, filesStored: true };
}

export async function loadCompany(): Promise<{ name: string; registration: string } | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data } = await supabase
    .from("contractors")
    .select("company_name, registration_number")
    .eq("profile_id", userData.user.id)
    .maybeSingle();
  if (!data || typeof data.company_name !== "string") return null;
  return {
    name: data.company_name,
    registration: typeof data.registration_number === "string" ? data.registration_number : "",
  };
}

export async function updateCompany(companyName: string, registrationNumber: string): Promise<string | null> {
  if (!supabase) return "The register is not configured.";
  const name = companyName.trim();
  if (!name) return "Enter the company name.";
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return "Sign in again.";
  const { data: existing } = await supabase
    .from("contractors")
    .select("id")
    .eq("profile_id", userData.user.id)
    .maybeSingle();
  if (!existing) return "Ask an administrator to finish this account.";
  const { error } = await supabase
    .from("contractors")
    .update({
      company_name: name,
      registration_number: registrationNumber.trim() || null,
    })
    .eq("profile_id", userData.user.id);
  return error ? error.message || "Could not update the company." : null;
}

export async function loadNotifications(): Promise<{ id: string; title: string; body: string }[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("notifications")
    .select("id, title, body")
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []).flatMap((row) =>
    typeof row.id === "string"
      ? [{ id: row.id, title: typeof row.title === "string" ? row.title : "", body: typeof row.body === "string" ? row.body : "" }]
      : [],
  );
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
  const channel = client.channel(`public-register-${(watchSeq += 1)}`);
  for (const table of ["tenders", "tender_documents", "awards", "projects", "expenditure", "bids"]) {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
  }
  channel.subscribe();
  return () => {
    clearTimeout(timer);
    void client.removeChannel(channel);
  };
}

export async function openDocument(path: string): Promise<{ url: string | null; error: string }> {
  if (!supabase || !path) return { url: null, error: "This file is listed but not stored yet." };
  const { data, error } = await supabase.storage.from("tender-documents").createSignedUrl(path, 60);
  if (error || !data?.signedUrl) {
    const missing = !error || /not found|404/i.test(error.message);
    return { url: null, error: missing ? "This file is listed but not stored yet." : "File could not be opened." };
  }
  return { url: data.signedUrl, error: "" };
}
