import { STATUS_ACTION, TENDER_STATUS_LABEL } from "@tender/fixtures";
import type { TenderStatus } from "@tender/shared";
import { TENDER_STATUSES } from "@tender/shared";
import { Stack, useLocalSearchParams, type Href } from "expo-router";

import { Body, QuietButton, Screen, Title } from "@/src/kit";

function isStatus(value: string): value is TenderStatus {
  return (TENDER_STATUSES as readonly string[]).includes(value);
}

export default function HeldScreen() {
  const params = useLocalSearchParams<{ kind?: string; to?: string }>();
  const kind = typeof params.kind === "string" ? params.kind : "";
  const to = typeof params.to === "string" ? params.to : "";

  let title = "Saved";
  let body = "The register has the latest change.";
  let backHref: Href = "/";
  let backLabel = "Back to pipeline";

  if (kind === "draft") {
    title = "Draft saved";
    body = "The tender is on the register as a draft.";
    backHref = "/tenders";
    backLabel = "Back to tenders";
  } else if (kind === "status" && isStatus(to)) {
    title = `${STATUS_ACTION[to]} recorded`;
    body = `Status is now ${TENDER_STATUS_LABEL[to]}.`;
    backHref = "/tenders";
    backLabel = "Back to tenders";
  } else if (kind === "review") {
    title = "Suggestion reviewed";
    body = "The suggestion is marked. Official tender fields are unchanged.";
    backHref = "/reviews";
    backLabel = "Back to suggestions";
  } else if (kind === "score") {
    title = "Score saved";
    body = "The score is on the desk. It stays off the public record.";
    backHref = "/scores";
    backLabel = "Back to scores";
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Saved" }} />
      <Title>{title}</Title>
      <Body>{body}</Body>
      <QuietButton label={backLabel} href={backHref} />
    </Screen>
  );
}
