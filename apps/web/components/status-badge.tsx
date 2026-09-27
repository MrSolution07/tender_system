import type { TenderStatus } from "@tender/shared";
import { Badge } from "@/components/ui/badge";
import { TENDER_STATUS_LABEL } from "@/lib/labels";

const variantFor: Record<
  TenderStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "outline",
  published: "default",
  closed: "secondary",
  evaluating: "secondary",
  awarded: "default",
  completed: "outline",
  archived: "destructive",
};

export function StatusBadge({ status }: { status: TenderStatus }) {
  return <Badge variant={variantFor[status]}>{TENDER_STATUS_LABEL[status]}</Badge>;
}
