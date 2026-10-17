import type { ProjectStatus } from "@tender/shared";
import { PROJECT_STATUS_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

const tone: Record<ProjectStatus, { pill: string; dot: string }> = {
  not_started: {
    pill: "bg-status-draft-bg text-status-draft-fg",
    dot: "bg-status-draft-dot",
  },
  in_progress: {
    pill: "bg-status-published-bg text-status-published-fg",
    dot: "bg-status-published-dot",
  },
  delayed: {
    pill: "bg-status-closed-bg text-status-closed-fg",
    dot: "bg-status-closed-dot",
  },
  completed: {
    pill: "bg-status-awarded-bg text-status-awarded-fg",
    dot: "bg-status-awarded-dot",
  },
};

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const { pill, dot } = tone[status];

  return (
    <span
      data-slot="project-status-badge"
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold",
        pill,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dot)} />
      {PROJECT_STATUS_LABEL[status]}
    </span>
  );
}
