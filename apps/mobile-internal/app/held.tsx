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
  const kind = typeof params.kind === "string" ? params.kind : "preview";
  const to = typeof params.to === "string" ? params.to : "";

  let title = "Nothing was saved";
  let body = "This preview does not write to the register.";
  let backHref: Href = "/";
  let backLabel = "Back to pipeline";

  if (kind === "draft") {
    title = "Draft not saved";
    body = "The form stayed on this phone. No tender was created.";
    backHref = "/tenders";
    backLabel = "Back to tenders";
  } else if (kind === "status" && isStatus(to)) {
    title = `${STATUS_ACTION[to]} did not run`;
    body = `Status is still the sample value. It was not set to ${TENDER_STATUS_LABEL[to]}.`;
    backHref = "/tenders";
    backLabel = "Back to tenders";
  } else if (kind === "review") {
    title = "Suggestion not applied";
    body =
      "Approve and correct stay on the screen. Official tender fields are unchanged.";
    backHref = "/reviews";
    backLabel = "Back to suggestions";
  } else if (kind === "score") {
    title = "Score not saved";
    body = "The score stayed in the form. It was not written to the sample bid.";
    backHref = "/scores";
    backLabel = "Back to scores";
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Preview" }} />
      <Title>{title}</Title>
      <Body>{body}</Body>
      <QuietButton label={backLabel} href={backHref} />
    </Screen>
  );
}
