"use client";

import {
  canTransition,
  type AiReviewStatus,
  type TenderStatus,
} from "@tender/shared";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  DESK_PEOPLE,
  initialSampleState,
  type DeskRole,
  type SampleAward,
  type SampleEvaluation,
  type SampleReview,
  type SampleState,
  type SampleTender,
} from "./sample-data";

const STORAGE_KEY = "major-tech-sample-register";

type Action =
  | { type: "hydrate"; state: SampleState }
  | { type: "reset" }
  | { type: "sign-in"; role: DeskRole }
  | { type: "sign-out" }
  | { type: "set-status"; tenderId: string; status: TenderStatus }
  | { type: "create-tender"; tender: SampleTender }
  | {
      type: "review";
      reviewId: string;
      status: Extract<AiReviewStatus, "approved" | "corrected">;
    }
  | { type: "score"; evaluationId: string; score: number; comments: string };

function reducer(state: SampleState, action: Action): SampleState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return initialSampleState;
    case "sign-in":
      return {
        ...state,
        session: { role: action.role, name: DESK_PEOPLE[action.role] },
      };
    case "sign-out":
      return { ...state, session: null };
    case "set-status":
      return {
        ...state,
        tenders: state.tenders.map((tender) => {
          if (tender.id !== action.tenderId) return tender;
          if (!canTransition(tender.status, action.status)) return tender;
          const publishedAt =
            action.status === "published" && tender.publishedAt === null
              ? new Date().toISOString()
              : tender.publishedAt;
          return { ...tender, status: action.status, publishedAt };
        }),
      };
    case "create-tender":
      return { ...state, tenders: [action.tender, ...state.tenders] };
    case "review":
      return {
        ...state,
        reviews: state.reviews.map((review) =>
          review.id === action.reviewId && review.reviewStatus === "needs_review"
            ? { ...review, reviewStatus: action.status }
            : review,
        ),
      };
    case "score":
      return {
        ...state,
        evaluations: state.evaluations.map((evaluation) =>
          evaluation.id === action.evaluationId
            ? {
                ...evaluation,
                score: action.score,
                comments: action.comments,
                compliancePass: action.score >= 50,
              }
            : evaluation,
        ),
      };
    default:
      return state;
  }
}

type StoreValue = {
  ready: boolean;
  tenders: SampleTender[];
  reviews: SampleReview[];
  awards: SampleAward[];
  evaluations: SampleEvaluation[];
  session: SampleState["session"];
  signIn: (role: DeskRole) => void;
  signOut: () => void;
  resetSample: () => void;
  setStatus: (tenderId: string, status: TenderStatus) => boolean;
  createTender: (input: {
    title: string;
    description: string;
    category: string;
    department: string;
    budgetCents: number;
    closingAt: string;
  }) => SampleTender;
  reviewSuggestion: (
    reviewId: string,
    status: Extract<AiReviewStatus, "approved" | "corrected">,
  ) => boolean;
  saveScore: (evaluationId: string, score: number, comments: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function isSampleState(value: unknown): value is SampleState {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    Array.isArray(record.tenders) &&
    Array.isArray(record.reviews) &&
    Array.isArray(record.awards) &&
    Array.isArray(record.evaluations)
  );
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialSampleState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isSampleState(parsed)) {
          dispatch({ type: "hydrate", state: parsed });
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Preview storage can fill up. The in-memory register still works.
    }
  }, [ready, state]);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      tenders: state.tenders,
      reviews: state.reviews,
      awards: state.awards,
      evaluations: state.evaluations,
      session: state.session,
      signIn: (role) => dispatch({ type: "sign-in", role }),
      signOut: () => dispatch({ type: "sign-out" }),
      resetSample: () => dispatch({ type: "reset" }),
      setStatus: (tenderId, status) => {
        const tender = state.tenders.find((item) => item.id === tenderId);
        if (!tender || !canTransition(tender.status, status)) return false;
        dispatch({ type: "set-status", tenderId, status });
        return true;
      },
      createTender: (input) => {
        const tender: SampleTender = {
          id: `t-${crypto.randomUUID()}`,
          title: input.title,
          description: input.description,
          category: input.category,
          department: input.department,
          budgetCents: input.budgetCents,
          status: "draft",
          publishedAt: null,
          closingAt: input.closingAt,
          requirements: [],
          documents: [],
        };
        dispatch({ type: "create-tender", tender });
        return tender;
      },
      reviewSuggestion: (reviewId, status) => {
        const review = state.reviews.find((item) => item.id === reviewId);
        if (!review || review.reviewStatus !== "needs_review") return false;
        dispatch({ type: "review", reviewId, status });
        return true;
      },
      saveScore: (evaluationId, score, comments) => {
        dispatch({ type: "score", evaluationId, score, comments });
      },
    }),
    [ready, state],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return value;
}
