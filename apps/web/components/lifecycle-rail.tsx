import Link from "next/link";
import { cn } from "@/lib/utils";

type Stage =
  | { name: string; open: false }
  | { name: string; open: true; href: string; count: number; label: string };

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

export function LifecycleRail({
  openCount,
  awardCount,
  completedCount,
  className,
}: {
  openCount: number;
  awardCount: number;
  completedCount: number;
  className?: string;
}) {
  const stages: Stage[] = [
    { name: "Draft", open: false },
    {
      name: "Published",
      open: true,
      href: "/tenders",
      count: openCount,
      label: plural(openCount, "open notice", "open notices"),
    },
    { name: "Closed", open: false },
    { name: "Evaluating", open: false },
    {
      name: "Awarded",
      open: true,
      href: "/awards",
      count: awardCount,
      label: plural(awardCount, "award on record", "awards on record"),
    },
    {
      name: "Completed",
      open: true,
      href: "/awards",
      count: completedCount,
      label: plural(completedCount, "project completed", "projects completed"),
    },
  ];

  return (
    <div className={className}>
      <ol aria-label="The life of a tender">
        {stages.map((stage, index) => {
          const next = stages[index + 1];
          const last = next === undefined;

          return (
            <li
              key={stage.name}
              className={cn(
                "relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-4",
                last ? "" : stage.open ? "pb-7" : "pb-5",
              )}
            >
              {next ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-6 bottom-0 left-[11px]",
                    stage.open && next.open
                      ? "w-0.5 bg-primary-foreground"
                      : "w-0 border-l-2 border-dashed border-primary-foreground/50",
                  )}
                />
              ) : null}

              {stage.open ? (
                <span
                  aria-hidden="true"
                  className="relative grid size-6 place-items-center rounded-full bg-white"
                >
                  <span className="size-2 rounded-full bg-primary" />
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className="relative size-6 rounded-full border-2 border-dashed border-primary-foreground/50"
                />
              )}

              {stage.open ? (
                <Link
                  href={stage.href}
                  className="group block rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground"
                >
                  <span className="block text-sm leading-6 font-medium text-primary-foreground/90">
                    {stage.name}
                  </span>
                  <span className="flex items-baseline gap-2.5">
                    <span className="font-display text-4xl leading-none font-semibold tabular-nums">
                      {stage.count}
                    </span>
                    <span className="text-lg underline-offset-4 group-hover:underline">
                      {stage.label}
                    </span>
                  </span>
                </Link>
              ) : (
                <p className="text-sm leading-6 text-primary-foreground/85">
                  {stage.name}
                  <span className="sr-only"> (handled inside the staff desk)</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-7 grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-4">
        <span
          aria-hidden="true"
          className="size-6 rounded-full border-2 border-dashed border-primary-foreground/50"
        />
        <p className="text-sm leading-6 text-pretty text-primary-foreground/85">
          Dashed stages happen inside the staff desk. Bids and scores are never
          published.
        </p>
      </div>
    </div>
  );
}
