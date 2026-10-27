import { canTransition, hasExtractedLines, TENDER_DOCUMENT_KINDS, TENDER_STATUSES, type TenderDocumentKind, type TenderStatus } from "@tender/shared";
import { STATUS_ACTION, TENDER_STATUS_LABEL, formatDate, formatRand } from "@tender/fixtures";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Linking } from "react-native";

import { pickFile } from "@/src/files";
import {
  Badge,
  Body,
  Fact,
  Field,
  FormError,
  Heading,
  PrimaryButton,
  QuietButton,
  Screen,
  Title,
} from "@/src/kit";
import {
  addCriterion,
  addRequirement,
  assignEvaluator,
  copyExtracted,
  loadEvaluators,
  loadTenderBids,
  openBidFile,
  openTenderFile,
  recordAward,
  tenderHasAward,
  uploadTenderFile,
  type TenderBid,
} from "@/src/operate";
import { loadReviews, loadTenders, setTenderStatus, type DeskReview, type DeskTender } from "@/src/queries";
import { useSession } from "@/src/session";

export default function TenderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const [tender, setTender] = useState<DeskTender | null | undefined>(undefined);
  const [review, setReview] = useState<DeskReview | null>(null);
  const [bids, setBids] = useState<TenderBid[]>([]);
  const [evaluators, setEvaluators] = useState<{ id: string; name: string }[]>([]);
  const [kind, setKind] = useState<TenderDocumentKind>("specification");
  const [requirement, setRequirement] = useState("");
  const [criterion, setCriterion] = useState("");
  const [weight, setWeight] = useState("10");
  const [evaluatorId, setEvaluatorId] = useState("");
  const [bidId, setBidId] = useState("");
  const [hasAward, setHasAward] = useState(false);
  const [message, setMessage] = useState("");

  const canChange = session?.role === "procurement_officer" || session?.role === "super_admin";

  async function reload(tenderId: string) {
    const [rows, reviews, bidRows, people, awarded] = await Promise.all([
      loadTenders(),
      loadReviews(),
      loadTenderBids(tenderId),
      canChange ? loadEvaluators() : Promise.resolve([]),
      tenderHasAward(tenderId),
    ]);
    setTender(rows.find((item) => item.id === tenderId) ?? null);
    setReview(reviews.find((item) => item.tenderId === tenderId) ?? null);
    setBids(bidRows);
    setHasAward(awarded);
    setEvaluators(people);
    setEvaluatorId((current) => current || people[0]?.id || "");
  }

  useEffect(() => {
    if (typeof id !== "string") {
      setTender(null);
      return;
    }
    void reload(id);
  }, [id, canChange]);

  if (!tender) {
    return (
      <Screen>
        <Title>{tender === undefined ? "Loading the tender." : "Tender not found"}</Title>
        <QuietButton label="Back to tenders" href="/tenders" />
      </Screen>
    );
  }

  const current = tender;
  const destinations = TENDER_STATUSES.filter(
    (status) => canTransition(current.status, status) && status !== "awarded",
  );
  const winners = bids.filter((bid) => bid.status === "submitted" || bid.status === "accepted");

  async function move(status: TenderStatus) {
    if (status === "published") {
      if (!current.closingAt) {
        setMessage("Add a closing date before publishing.");
        return;
      }
      if (current.requirements.length === 0) {
        setMessage("Add a requirement before publishing.");
        return;
      }
      if (current.documents.length === 0) {
        setMessage("Upload a pack file before publishing.");
        return;
      }
    }
    const error = await setTenderStatus(current.id, status);
    if (error) {
      setMessage(error);
      return;
    }
    router.replace(`/held?kind=status&to=${status}`);
  }

  async function upload() {
    const picked = await pickFile();
    if ("canceled" in picked) return;
    if ("error" in picked) {
      setMessage(picked.error);
      return;
    }
    const error = await uploadTenderFile(current.id, picked, kind);
    setMessage(error ?? "");
    if (!error) await reload(current.id);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Tender" }} />
      <Badge label={TENDER_STATUS_LABEL[tender.status]} />
      <Title>{tender.title}</Title>
      <Body>{tender.department}</Body>
      <Fact label="Category" value={tender.category} />
      <Fact label="Closes" value={tender.closingAt ? formatDate(tender.closingAt) : "Not set"} />
      <Fact label="Budget" value={formatRand(tender.budgetCents)} />
      <Body>{tender.description}</Body>
      <Heading>Requirements</Heading>
      {tender.requirements.length === 0 ? <Body>No requirements yet.</Body> : null}
      {tender.requirements.map((item) => (
        <Body key={item.id}>{item.body}</Body>
      ))}
      {canChange && tender.status === "draft" ? (
        <>
          <Field label="Requirement" value={requirement} onChangeText={setRequirement} />
          <PrimaryButton
            label="Add requirement"
            onPress={() => {
              void addRequirement(tender.id, requirement).then(async (error) => {
                setMessage(error ?? "");
                if (!error) {
                  setRequirement("");
                  await reload(tender.id);
                }
              });
            }}
          />
          <Heading>Criteria</Heading>
          <Field label="Criterion" value={criterion} onChangeText={setCriterion} />
          <Field label="Weight (0–100)" value={weight} onChangeText={setWeight} />
          <PrimaryButton
            label="Add criterion"
            onPress={() => {
              void addCriterion(tender.id, criterion, Number(weight)).then((error) => {
                setMessage(error ?? "");
                if (!error) setCriterion("");
              });
            }}
          />
        </>
      ) : null}
      <Heading>Documents</Heading>
      {tender.documents.length === 0 ? <Body>No files on this tender.</Body> : null}
      {tender.documents.map((document) => (
        <QuietButton
          key={document.id}
          label={document.fileName}
          onPress={() => {
            void openTenderFile(document.path).then(async (result) => {
              if (!result.url) {
                setMessage(result.error ?? "This file is listed but not stored yet.");
                return;
              }
              await Linking.openURL(result.url);
            });
          }}
        />
      ))}
      {canChange && tender.status === "draft" ? (
        <>
          {TENDER_DOCUMENT_KINDS.map((item) => (
            <QuietButton
              key={item}
              label={item}
              selected={kind === item}
              onPress={() => setKind(item)}
            />
          ))}
          <PrimaryButton label="Upload file" onPress={() => void upload()} />
        </>
      ) : null}
      {review ? (
        <>
          <Heading>Suggested</Heading>
          <Body>{review.summary}</Body>
          <QuietButton label="Open suggestion" href={`/review/${review.id}`} />
          {canChange &&
          tender.status === "draft" &&
          (review.reviewStatus === "approved" || review.reviewStatus === "corrected") &&
          hasExtractedLines(review.extracted) ? (
            <PrimaryButton
              label="Copy approved suggestion"
              onPress={() => {
                void copyExtracted(tender.id, review.extracted).then(async (error) => {
                  setMessage(error ?? "");
                  if (!error) await reload(tender.id);
                });
              }}
            />
          ) : null}
          {canChange &&
          tender.status === "draft" &&
          (review.reviewStatus === "approved" || review.reviewStatus === "corrected") &&
          !hasExtractedLines(review.extracted) ? (
            <Body>This suggestion has no extracted lines to copy.</Body>
          ) : null}
        </>
      ) : null}
      <Heading>Bids</Heading>
      {bids.length === 0 ? <Body>No bids on this tender yet.</Body> : null}
      {bids.map((bid) => (
        <Body key={bid.id}>
          {bid.contractor}. {formatRand(bid.amountCents)}. {bid.status}
        </Body>
      ))}
      {bids.flatMap((bid) =>
        bid.files.map((file) => (
          <QuietButton
            key={file.id}
            label={file.fileName}
            onPress={() => {
              void openBidFile(file.path).then(async (result) => {
                if (!result.url) {
                  setMessage(result.error ?? "This file is listed but not stored yet.");
                  return;
                }
                await Linking.openURL(result.url);
              });
            }}
          />
        )),
      )}
      {canChange ? (
        <>
          <Heading>Assign an evaluator</Heading>
          {evaluators.length === 0 ? <Body>No evaluator accounts exist yet.</Body> : null}
          {evaluators.map((person) => (
            <QuietButton
              key={person.id}
              label={person.name}
              selected={evaluatorId === person.id}
              onPress={() => setEvaluatorId(person.id)}
            />
          ))}
          <PrimaryButton
            label="Assign"
            onPress={() => {
              void assignEvaluator(tender.id, evaluatorId).then((error) => setMessage(error ?? ""));
            }}
          />
        </>
      ) : null}
      {canChange && (tender.status === "evaluating" || (tender.status === "awarded" && !hasAward)) ? (
        <>
          <Heading>Record the award</Heading>
          {winners.length === 0 ? <Body>There is no submitted bid to award.</Body> : null}
          {winners.map((bid) => (
            <QuietButton
              key={bid.id}
              label={`${bid.contractor} ${formatRand(bid.amountCents)}`}
              selected={bidId === bid.id}
              onPress={() => setBidId(bid.id)}
            />
          ))}
          <PrimaryButton
            label="Record award"
            onPress={() => {
              void recordAward({
                tenderId: tender.id,
                bidId,
                title: tender.title,
                status: tender.status,
              }).then(async (error) => {
                setMessage(error ?? "");
                if (!error) await reload(tender.id);
              });
            }}
          />
        </>
      ) : null}
      {canChange ? (
        <>
          <Heading>Status</Heading>
          <Body>A change is saved only when the register allows that step.</Body>
          {destinations.map((status) => (
            <PrimaryButton
              key={status}
              tone={status === "archived" ? "danger" : "brand"}
              label={STATUS_ACTION[status]}
              onPress={() => void move(status)}
            />
          ))}
        </>
      ) : (
        <Body>Evaluators read this tender. Status changes stay with procurement.</Body>
      )}
      {message ? <FormError>{message}</FormError> : null}
    </Screen>
  );
}
