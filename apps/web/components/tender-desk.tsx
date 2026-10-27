"use client";

import {
  PROJECT_STATUSES,
  TENDER_DOCUMENT_KINDS,
  hasExtractedLines,
  type ProjectStatus,
  type TenderDocumentKind,
  type TenderStatus,
} from "@tender/shared";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOCUMENT_KIND_LABEL, PROJECT_STATUS_LABEL } from "@/lib/labels";
import {
  addCriterion,
  addRequirement,
  addSpend,
  assignEvaluator,
  copyExtracted,
  loadAssignments,
  loadAward,
  loadCriteria,
  loadEvaluators,
  loadTenderBids,
  recordAward,
  signedBidUrl,
  signedTenderUrl,
  updateProject,
  uploadTenderFile,
  type AwardState,
  type TenderBid,
} from "@/lib/desk-ops";
import { formatRand } from "@/lib/format";
import type { ReviewRecord, TenderRecord } from "@/lib/register";

const AWARDABLE = new Set(["submitted", "accepted"]);

export function TenderDesk({
  tender,
  suggestion,
  canChange,
  onChanged,
}: {
  tender: TenderRecord;
  suggestion: ReviewRecord | undefined;
  canChange: boolean;
  onChanged: () => Promise<void>;
}) {
  return (
    <>
      <Documents tender={tender} canChange={canChange} onChanged={onChanged} />
      <Requirements tender={tender} canChange={canChange} suggestion={suggestion} onChanged={onChanged} />
      {canChange ? <Criteria tenderId={tender.id} status={tender.status} onChanged={onChanged} /> : null}
      <Bids tender={tender} canChange={canChange} onChanged={onChanged} />
    </>
  );
}

function Note({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Alert className="mt-4">
      <AlertTitle>Not saved</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function Documents({
  tender,
  canChange,
  onChanged,
}: {
  tender: TenderRecord;
  canChange: boolean;
  onChanged: () => Promise<void>;
}) {
  const [kind, setKind] = useState<TenderDocumentKind>("specification");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function open(path: string) {
    const result = await signedTenderUrl(path);
    if (!result.url) {
      setMessage(result.error);
      return;
    }
    setMessage(null);
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold">Documents</h2>
      {tender.documents.length === 0 ? (
        <p className="mt-3 text-muted-foreground">No files on this tender.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {tender.documents.map((document) => (
            <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span>
                {document.fileName}
                <span className="ml-2 text-muted-foreground">
                  {document.kind || "file"} · v{document.version}
                </span>
              </span>
              <Button type="button" variant="outline" className="h-11" onClick={() => void open(document.path)}>
                Open
              </Button>
            </li>
          ))}
        </ul>
      )}
      {canChange && tender.status === "draft" ? (
        <form
          className="mt-4 grid max-w-lg gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const input = event.currentTarget.elements.namedItem("pack");
            const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
            if (!file) {
              setMessage("Choose a file.");
              return;
            }
            setBusy(true);
            void uploadTenderFile(tender.id, file, kind).then(async (error) => {
              setBusy(false);
              setMessage(error);
              if (!error) {
                if (input instanceof HTMLInputElement) input.value = "";
                await onChanged();
              }
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="pack-kind">Kind</Label>
            <Select value={kind} onValueChange={(value) => setKind(value as TenderDocumentKind)}>
              <SelectTrigger id="pack-kind" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TENDER_DOCUMENT_KINDS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {DOCUMENT_KIND_LABEL[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pack">File</Label>
            <Input id="pack" name="pack" type="file" className="h-11" />
          </div>
          <Button type="submit" className="h-11 w-fit" disabled={busy}>
            {busy ? "Uploading" : "Upload file"}
          </Button>
        </form>
      ) : null}
      <Note message={message} />
    </section>
  );
}

function Requirements({
  tender,
  canChange,
  suggestion,
  onChanged,
}: {
  tender: TenderRecord;
  canChange: boolean;
  suggestion: ReviewRecord | undefined;
  onChanged: () => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const canCopy =
    canChange &&
    tender.status === "draft" &&
    suggestion &&
    (suggestion.reviewStatus === "approved" || suggestion.reviewStatus === "corrected") &&
    hasExtractedLines(suggestion.extracted);

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold">Requirements</h2>
      {tender.requirements.length === 0 ? (
        <p className="mt-3 text-muted-foreground">No requirements on this draft yet.</p>
      ) : (
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {tender.requirements.map((requirement) => (
            <li key={requirement.id}>{requirement.body}</li>
          ))}
        </ul>
      )}
      {canChange && tender.status === "draft" ? (
        <form
          className="mt-4 grid max-w-lg gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const mandatory = event.currentTarget.elements.namedItem("mandatory");
            void addRequirement(
              tender.id,
              body,
              mandatory instanceof HTMLInputElement ? mandatory.checked : true,
            ).then(async (error) => {
              setMessage(error);
              if (!error) {
                setBody("");
                await onChanged();
              }
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="requirement">Requirement</Label>
            <Input id="requirement" value={body} onChange={(event) => setBody(event.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm" htmlFor="mandatory">
            <input id="mandatory" name="mandatory" type="checkbox" defaultChecked />
            Mandatory
          </label>
          <Button type="submit" className="h-11 w-fit">
            Add requirement
          </Button>
        </form>
      ) : null}
      {canCopy ? (
        <Button
          type="button"
          variant="outline"
          className="mt-3 h-11"
          onClick={() => {
            if (!suggestion) return;
            void copyExtracted(tender.id, suggestion.extracted).then(async (error) => {
              setMessage(error);
              if (!error) await onChanged();
            });
          }}
        >
          Copy approved suggestion
        </Button>
      ) : suggestion &&
        (suggestion.reviewStatus === "approved" || suggestion.reviewStatus === "corrected") &&
        canChange &&
        tender.status === "draft" ? (
        <p className="mt-3 text-sm text-muted-foreground">
          This suggestion has no extracted lines to copy.
        </p>
      ) : null}
      <Note message={message} />
    </section>
  );
}

function Criteria({
  tenderId,
  status,
  onChanged,
}: {
  tenderId: string;
  status: TenderStatus;
  onChanged: () => Promise<void>;
}) {
  const [rows, setRows] = useState<{ label: string; weight: number }[]>([]);
  const [label, setLabel] = useState("");
  const [weight, setWeight] = useState("10");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadCriteria(tenderId).then(setRows);
  }, [tenderId, status]);

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold">Criteria</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-muted-foreground">No scoring criteria yet.</p>
      ) : (
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {rows.map((row) => (
            <li key={`${row.label}-${row.weight}`}>
              {row.label} <span className="text-muted-foreground">({row.weight})</span>
            </li>
          ))}
        </ul>
      )}
      {status === "draft" ? (
        <form
          className="mt-4 grid max-w-lg gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = Number(weight);
            void addCriterion(tenderId, label, parsed).then(async (error) => {
              setMessage(error);
              if (!error) {
                setLabel("");
                setRows(await loadCriteria(tenderId));
                await onChanged();
              }
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="criterion">Criterion</Label>
            <Input id="criterion" value={label} onChange={(event) => setLabel(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="weight">Weight (0–100)</Label>
            <Input id="weight" inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value)} />
          </div>
          <Button type="submit" className="h-11 w-fit">
            Add criterion
          </Button>
        </form>
      ) : null}
      <Note message={message} />
    </section>
  );
}

function Bids({
  tender,
  canChange,
  onChanged,
}: {
  tender: TenderRecord;
  canChange: boolean;
  onChanged: () => Promise<void>;
}) {
  const [bids, setBids] = useState<TenderBid[]>([]);
  const [evaluators, setEvaluators] = useState<{ id: string; name: string }[]>([]);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [evaluatorId, setEvaluatorId] = useState("");
  const [bidId, setBidId] = useState("");
  const [award, setAward] = useState<AwardState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState("0");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("not_started");
  const [spend, setSpend] = useState("");
  const [spentOn, setSpentOn] = useState("");
  const [spendNote, setSpendNote] = useState("");

  useEffect(() => {
    let alive = true;
    void Promise.all([
      loadTenderBids(tender.id),
      loadEvaluators(),
      loadAssignments(tender.id),
      loadAward(tender.id),
    ]).then(([bidResult, evaluatorResult, assignmentIds, awardState]) => {
      if (!alive) return;
      setBids(bidResult.bids);
      setEvaluators(evaluatorResult.people);
      setAssigned(assignmentIds);
      setAward(awardState);
      if (awardState) {
        setProgress(String(awardState.progress));
        setProjectStatus(awardState.status);
      }
      setMessage(bidResult.error ?? evaluatorResult.error);
    });
    return () => {
      alive = false;
    };
  }, [tender.id, tender.status]);

  const winners = bids.filter((bid) => AWARDABLE.has(bid.status));
  const showAward =
    canChange && (tender.status === "evaluating" || (tender.status === "awarded" && !award));

  async function openBidFile(path: string) {
    const result = await signedBidUrl(path);
    if (!result.url) {
      setMessage(result.error);
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold">Bids</h2>
      {bids.length === 0 ? (
        <p className="mt-3 text-muted-foreground">No bids on this tender yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {bids.map((bid) => (
            <li key={bid.id} className="py-3 text-sm">
              <p className="font-medium">
                {bid.contractor} · {formatRand(bid.amountCents)} · {bid.status}
              </p>
              {bid.files.length === 0 ? (
                <p className="mt-1 text-muted-foreground">No attachments.</p>
              ) : (
                <ul className="mt-2 grid gap-2">
                  {bid.files.map((file) => (
                    <li key={file.id}>
                      <Button type="button" variant="outline" className="h-11" onClick={() => void openBidFile(file.path)}>
                        {file.fileName}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {canChange ? (
        <form
          className="mt-4 grid max-w-lg gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void assignEvaluator(tender.id, evaluatorId).then(async (error) => {
              setMessage(error ?? (evaluatorId ? null : "Choose an evaluator."));
              if (!error) setAssigned(await loadAssignments(tender.id));
            });
          }}
        >
          <h3 className="font-display text-xl font-semibold">Assign an evaluator</h3>
          {evaluators.length === 0 ? (
            <p className="text-sm text-muted-foreground">No evaluator accounts exist yet.</p>
          ) : (
            <Select value={evaluatorId || undefined} onValueChange={setEvaluatorId}>
              <SelectTrigger className="h-11 w-full" aria-label="Evaluator">
                <SelectValue placeholder="Choose an evaluator" />
              </SelectTrigger>
              <SelectContent>
                {evaluators.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                    {assigned.includes(person.id) ? " (assigned)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button type="submit" className="h-11 w-fit" disabled={evaluators.length === 0}>
            Assign
          </Button>
        </form>
      ) : null}

      {showAward ? (
        <form
          className="mt-6 grid max-w-lg gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void recordAward({
              tenderId: tender.id,
              bidId,
              title: tender.title,
              status: tender.status,
            }).then(async (error) => {
              setMessage(error);
              if (!error) await onChanged();
            });
          }}
        >
          <h3 className="font-display text-xl font-semibold">Record the award</h3>
          {winners.length === 0 ? (
            <p className="text-sm text-muted-foreground">There is no submitted bid to award.</p>
          ) : (
            <Select value={bidId || undefined} onValueChange={setBidId}>
              <SelectTrigger className="h-11 w-full" aria-label="Winning bid">
                <SelectValue placeholder="Choose the winning bid" />
              </SelectTrigger>
              <SelectContent>
                {winners.map((bid) => (
                  <SelectItem key={bid.id} value={bid.id}>
                    {bid.contractor} · {formatRand(bid.amountCents)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button type="submit" className="h-11 w-fit" disabled={winners.length === 0 || !bidId}>
            Record award
          </Button>
        </form>
      ) : null}

      {canChange && award?.projectId ? (
        <div className="mt-6 grid max-w-lg gap-6">
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!award.projectId) return;
              void updateProject(award.projectId, Number(progress), projectStatus).then(async (error) => {
                setMessage(error);
                if (!error) await onChanged();
              });
            }}
          >
            <h3 className="font-display text-xl font-semibold">Project</h3>
            <div className="grid gap-2">
              <Label htmlFor="progress">Progress (0–100)</Label>
              <Input id="progress" inputMode="numeric" value={progress} onChange={(event) => setProgress(event.target.value)} />
            </div>
            <Select value={projectStatus} onValueChange={(value) => setProjectStatus(value as ProjectStatus)}>
              <SelectTrigger className="h-11 w-full" aria-label="Project status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {PROJECT_STATUS_LABEL[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="h-11 w-fit">
              Update project
            </Button>
          </form>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!award.projectId) return;
              const rands = Number(spend.replace(/,/g, ""));
              if (!Number.isFinite(rands) || rands < 0) {
                setMessage("Enter a spend amount of zero or more.");
                return;
              }
              void addSpend(award.projectId, Math.round(rands * 100), spentOn, spendNote).then(async (error) => {
                setMessage(error);
                if (!error) {
                  setSpend("");
                  setSpendNote("");
                  await onChanged();
                }
              });
            }}
          >
            <h3 className="font-display text-xl font-semibold">Spend</h3>
            <div className="grid gap-2">
              <Label htmlFor="spend">Amount (ZAR)</Label>
              <Input id="spend" inputMode="decimal" value={spend} onChange={(event) => setSpend(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="spent-on">Date</Label>
              <Input id="spent-on" type="date" value={spentOn} onChange={(event) => setSpentOn(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="spend-note">Description</Label>
              <Input id="spend-note" value={spendNote} onChange={(event) => setSpendNote(event.target.value)} />
            </div>
            <Button type="submit" className="h-11 w-fit">
              Add spend
            </Button>
          </form>
        </div>
      ) : null}
      <Note message={message} />
    </section>
  );
}
