import type { TenderStatus } from "@tender/shared";
import { TENDER_STATUS_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

const tone: Record<TenderStatus, { pill: string; dot: string }> = {
  draft: {
    pill: "bg-status-draft-bg text-status-draft-fg",
    dot: "bg-status-draft-dot",
  },
  published: {
    pill: "bg-status-published-bg text-status-published-fg",
    dot: "bg-status-published-dot",
  },
  closed: {
    pill: "bg-status-closed-bg text-status-closed-fg",
    dot: "bg-status-closed-dot",
  },
  evaluating: {
    pill: "bg-status-evaluating-bg text-status-evaluating-fg",
    dot: "bg-status-evaluating-dot",
  },
  awarded: {
    pill: "bg-status-awarded-bg text-status-awarded-fg",
    dot: "bg-status-awarded-dot",
  },
  completed: {
    pill: "bg-status-completed-bg text-status-completed-fg",
    dot: "bg-status-completed-dot",
  },
  archived: {
    pill: "bg-status-archived-bg text-status-archived-fg",
    dot: "bg-status-archived-dot",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: TenderStatus;
  className?: string;
}) {
  const { pill, dot } = tone[status];

  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold",
        pill,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dot)} />
      {TENDER_STATUS_LABEL[status]}
    </span>
  );
}
