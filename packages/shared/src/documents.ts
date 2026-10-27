export const DOCUMENT_KINDS = [
  "specification",
  "addendum",
  "form",
  "supporting",
  "bid_attachment",
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

/** Tender packs use the document kinds that belong on the notice, not bid files. */
export const TENDER_DOCUMENT_KINDS = [
  "specification",
  "addendum",
  "form",
  "supporting",
] as const satisfies readonly DocumentKind[];

export type TenderDocumentKind = (typeof TENDER_DOCUMENT_KINDS)[number];

/** Matches the private bucket limit in supabase/config.toml. */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export function isDocumentKind(value: unknown): value is DocumentKind {
  return typeof value === "string" && (DOCUMENT_KINDS as readonly string[]).includes(value);
}

export function isTenderDocumentKind(value: unknown): value is TenderDocumentKind {
  return (
    typeof value === "string" &&
    (TENDER_DOCUMENT_KINDS as readonly string[]).includes(value)
  );
}

/**
 * First path segment is the tender or bid id. Storage policies allow the
 * object only when that segment matches. A new id avoids silent overwrite.
 */
export function storageObjectName(ownerId: string, fileName: string): string {
  const cleaned = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  const base = cleaned.length > 0 ? cleaned : "file";
  return `${ownerId}/${randomId()}-${base}`;
}

function randomId(): string {
  const randomUUID = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID;
  if (randomUUID) return randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const value = char === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

export type ExtractedRequirement = { body: string; mandatory: boolean };
export type ExtractedCriterion = { label: string; weight: number };

export type ExtractedSuggestion = {
  requirements: ExtractedRequirement[];
  criteria: ExtractedCriterion[];
};

function weightOf(value: unknown): number {
  const weight = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(weight)) return 0;
  return Math.min(100, Math.max(0, Math.round(weight * 100) / 100));
}

/** Seeded analyses store `{}`. Unknown shapes contribute no lines. */
export function parseExtracted(value: unknown): ExtractedSuggestion {
  if (!value || typeof value !== "object") {
    return { requirements: [], criteria: [] };
  }
  const record = value as Record<string, unknown>;
  const requirements = Array.isArray(record.requirements)
    ? record.requirements.flatMap((item): ExtractedRequirement[] => {
        if (!item || typeof item !== "object") return [];
        const row = item as Record<string, unknown>;
        const body = typeof row.body === "string" ? row.body.trim() : "";
        if (!body) return [];
        return [{ body, mandatory: row.mandatory !== false }];
      })
    : [];
  const criteria = Array.isArray(record.criteria)
    ? record.criteria.flatMap((item): ExtractedCriterion[] => {
        if (!item || typeof item !== "object") return [];
        const row = item as Record<string, unknown>;
        const label = typeof row.label === "string" ? row.label.trim() : "";
        if (!label) return [];
        return [{ label, weight: weightOf(row.weight) }];
      })
    : [];
  return { requirements, criteria };
}

export function hasExtractedLines(value: ExtractedSuggestion): boolean {
  return value.requirements.length > 0 || value.criteria.length > 0;
}
