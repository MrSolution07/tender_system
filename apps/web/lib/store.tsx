"use client";

import {
  canTransition,
  parseExtracted,
  TENDER_STATUSES,
  type AiReviewStatus,
  type ProjectStatus,
  type TenderStatus,
} from "@tender/shared";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  AwardRecord,
  DeskRole,
  DeskSession,
  EvaluationRecord,
  ReviewRecord,
  TenderRecord,
} from "./register";
import { createSupabase, hasSupabaseConfig } from "./supabase";

type StoreValue = {
  ready: boolean;
  error: string | null;
  tenders: TenderRecord[];
  reviews: ReviewRecord[];
  awards: AwardRecord[];
  evaluations: EvaluationRecord[];
  session: DeskSession | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  reload: () => Promise<void>;
  setStatus: (tenderId: string, status: TenderStatus) => Promise<string | null>;
  createTender: (input: {
    title: string;
    description: string;
    category: string;
    department: string;
    budgetCents: number;
    closingAt: string;
  }) => Promise<TenderRecord>;
  reviewSuggestion: (
    reviewId: string,
    status: Extract<AiReviewStatus, "approved" | "corrected">,
  ) => Promise<boolean>;
  saveScore: (evaluationId: string, score: number, comments: string) => Promise<void>;
};

const StoreContext = createContext<StoreValue | null>(null);

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : Number(value) || 0;
}

function isStatus(value: unknown): value is TenderStatus {
  return typeof value === "string" && (TENDER_STATUSES as readonly string[]).includes(value);
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return (
    value === "not_started" ||
    value === "in_progress" ||
    value === "delayed" ||
    value === "completed"
  );
}

function isReviewStatus(value: unknown): value is AiReviewStatus {
  return (
    value === "pending" ||
    value === "processing" ||
    value === "needs_review" ||
    value === "approved" ||
    value === "corrected"
  );
}

function isDeskRole(value: unknown): value is DeskRole {
  return (
    value === "procurement_officer" ||
    value === "evaluator" ||
    value === "super_admin"
  );
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

function mapTender(row: Record<string, unknown>): TenderRecord | null {
  if (!isStatus(row.status) || typeof row.id !== "string") return null;
  return {
    id: row.id,
    title: text(row.title),
    description: text(row.description),
    category: text(row.category),
    department: text(row.department),
    budgetCents: num(row.budget_cents),
    status: row.status,
    publishedAt: typeof row.published_at === "string" ? row.published_at : null,
    closingAt: typeof row.closing_at === "string" ? row.closing_at : null,
    requirements: many(row.tender_requirements).flatMap((item) =>
      typeof item.id === "string"
        ? [{ id: item.id, body: text(item.body), mandatory: item.mandatory !== false }]
        : [],
    ),
    documents: many(row.tender_documents).flatMap((item) =>
      typeof item.id === "string"
        ? [{
            id: item.id,
            fileName: text(item.file_name),
            path: text(item.storage_path),
            kind: text(item.kind),
            version: num(item.version) || 1,
          }]
        : [],
    ),
  };
}

function mapReview(row: Record<string, unknown>): ReviewRecord | null {
  if (typeof row.id !== "string" || typeof row.tender_id !== "string") return null;
  if (!isReviewStatus(row.review_status)) return null;
  return {
    id: row.id,
    tenderId: row.tender_id,
    reviewStatus: row.review_status,
    summary: text(row.summary),
    model: text(row.model, "document-extractor"),
    extracted: parseExtracted(row.extracted),
  };
}

function mapAward(row: Record<string, unknown>): AwardRecord | null {
  if (typeof row.id !== "string" || typeof row.tender_id !== "string") return null;
  const contractor = one(row.contractors);
  const project = one(row.projects);
  const status = project && isProjectStatus(project.status) ? project.status : "not_started";
  return {
    id: row.id,
    tenderId: row.tender_id,
    contractor: text(contractor?.company_name, "Contractor"),
    awardedAt: text(row.awarded_at),
    projectTitle: text(project?.title, text(row.tender_id)),
    projectStatus: status,
    progressPercent: num(project?.progress_percent),
    locationLabel: text(project?.location_label),
    spend: many(project?.expenditure).flatMap((line) =>
      typeof line.id === "string"
        ? [{ id: line.id, label: text(line.description, "Spend"), amountCents: num(line.amount_cents) }]
        : [],
    ),
  };
}

function mapEvaluation(row: Record<string, unknown>): EvaluationRecord | null {
  if (typeof row.id !== "string") return null;
  const bid = one(row.bids);
  const contractor = one(bid?.contractors);
  if (!bid || typeof bid.tender_id !== "string") return null;
  return {
    id: row.id,
    tenderId: bid.tender_id,
    contractor: text(contractor?.company_name, "Contractor"),
    score: typeof row.score === "number" ? row.score : row.score === null ? null : num(row.score),
    comments: text(row.comments),
    compliancePass: typeof row.compliance_pass === "boolean" ? row.compliance_pass : null,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => (hasSupabaseConfig() ? createSupabase() : null), []);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenders, setTenders] = useState<TenderRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [session, setSession] = useState<DeskSession | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setError("The register is not configured.");
      setReady(true);
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle();
      const role = profile && isDeskRole(profile.role) ? profile.role : null;
      setSession(
        role
          ? { role, name: text(profile?.full_name, user.email ?? "Staff") }
          : null,
      );
    } else {
      setSession(null);
    }

    const [tenderRes, reviewRes, awardRes, evaluationRes] = await Promise.all([
      supabase
        .from("tenders")
        .select("id,title,description,category,department,budget_cents,status,published_at,closing_at,tender_requirements(id,body,mandatory),tender_documents(id,file_name,storage_path,kind,version)")
        .order("closing_at", { ascending: true }),
      supabase.from("ai_analyses").select("id,tender_id,review_status,summary,model,extracted"),
      supabase
        .from("awards")
        .select("id,tender_id,awarded_at,contractors(company_name),projects(title,status,progress_percent,location_label,expenditure(id,description,amount_cents))"),
      supabase
        .from("evaluations")
        .select("id,score,comments,compliance_pass,bids(tender_id,contractors(company_name))"),
    ]);
    const staffMiss = Boolean(user) && (reviewRes.error ?? evaluationRes.error);
    const failure = tenderRes.error ?? awardRes.error ?? staffMiss;
    setError(failure ? "The register could not be loaded." : null);
    setTenders(many(tenderRes.data).flatMap((row) => {
      const tender = mapTender(row);
      return tender ? [tender] : [];
    }));
    setReviews(reviewRes.error ? [] : many(reviewRes.data).flatMap((row) => {
      const review = mapReview(row);
      return review ? [review] : [];
    }));
    setAwards(many(awardRes.data).flatMap((row) => {
      const award = mapAward(row);
      return award ? [award] : [];
    }));
    setEvaluations(evaluationRes.error ? [] : many(evaluationRes.data).flatMap((row) => {
      const evaluation = mapEvaluation(row);
      return evaluation ? [evaluation] : [];
    }));
    setReady(true);
  }, [supabase]);

  useEffect(() => {
    void load();
    if (!supabase) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void load();
      }, 200);
    };
    const channel = supabase.channel("register");
    for (const table of ["tenders", "tender_documents", "awards", "projects", "expenditure", "bids", "evaluations", "ai_analyses"]) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
    }
    channel.subscribe();
    const auth = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => {
      clearTimeout(timer);
      void supabase.removeChannel(channel);
      auth.data.subscription.unsubscribe();
    };
  }, [load, supabase]);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      error,
      tenders,
      reviews,
      awards,
      evaluations,
      session,
      reload: load,
      signIn: async (email, password) => {
        if (!supabase) return "The register is not configured.";
        const { error: signError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (signError) return "Email or password is wrong.";
        await load();
        return null;
      },
      signOut: async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        setSession(null);
      },
      setStatus: async (tenderId, status) => {
        const tender = tenders.find((item) => item.id === tenderId);
        if (!supabase) return "The register is not configured.";
        if (!tender || !canTransition(tender.status, status)) {
          return "That status change is not allowed from here.";
        }
        const { error: updateError } = await supabase
          .from("tenders")
          .update({ status })
          .eq("id", tenderId);
        if (updateError) {
          return updateError.message || "That status change is not allowed from here.";
        }
        await load();
        return null;
      },
      createTender: async (input) => {
        if (!supabase) throw new Error("The register is not configured.");
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw new Error("Sign in again.");
        const { data, error: insertError } = await supabase
          .from("tenders")
          .insert({
            title: input.title,
            description: input.description,
            category: input.category,
            department: input.department,
            budget_cents: input.budgetCents,
            closing_at: input.closingAt,
            created_by: userData.user.id,
            status: "draft",
          })
          .select("id,title,description,category,department,budget_cents,status,published_at,closing_at")
          .single();
        if (insertError || !data) throw new Error("Could not save this tender.");
        const tender = mapTender(data as Record<string, unknown>);
        if (!tender) throw new Error("Could not save this tender.");
        await load();
        return tender;
      },
      reviewSuggestion: async (reviewId, status) => {
        if (!supabase) return false;
        const { data: userData } = await supabase.auth.getUser();
        const { error: updateError } = await supabase
          .from("ai_analyses")
          .update({
            review_status: status,
            reviewed_at: new Date().toISOString(),
            reviewed_by: userData.user?.id ?? null,
          })
          .eq("id", reviewId)
          .eq("review_status", "needs_review");
        if (updateError) return false;
        await load();
        return true;
      },
      saveScore: async (evaluationId, score, comments) => {
        if (!supabase) throw new Error("The register is not configured.");
        const { error: updateError } = await supabase
          .from("evaluations")
          .update({
            score,
            comments,
            compliance_pass: score >= 50,
          })
          .eq("id", evaluationId);
        if (updateError) throw new Error("Could not save the score.");
        await load();
      },
    }),
    [awards, error, evaluations, load, ready, reviews, session, supabase, tenders],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}
