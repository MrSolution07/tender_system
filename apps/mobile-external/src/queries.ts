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

export async function submitBid(tenderId: string, amountCents: number, note: string): Promise<string | null> {
  if (!supabase) return "The register is not configured.";
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return "Sign in to submit a bid.";
  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("profile_id", userData.user.id)
    .maybeSingle();
  if (!contractor || typeof contractor.id !== "string") return "No contractor record is linked to this account.";
  const { error } = await supabase.from("bids").insert({
    tender_id: tenderId,
    contractor_id: contractor.id,
    amount_cents: amountCents,
    note,
    status: "submitted",
  });
  if (error) return "This notice is not open for a bid.";
  return null;
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
  for (const table of ["tenders", "awards", "projects", "expenditure", "bids"]) {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
  }
  channel.subscribe();
  return () => {
    clearTimeout(timer);
    void client.removeChannel(channel);
  };
}

export async function openDocument(path: string): Promise<string | null> {
  if (!supabase || !path) return null;
  const { data, error } = await supabase.storage.from("tender-documents").createSignedUrl(path, 60);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
