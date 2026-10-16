"use client";

import type { TenderStatus } from "@tender/shared";
import {
  Bar,
  BarChart,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { TENDER_STATUS_LABEL } from "@/lib/labels";

const chartConfig = {
  count: { label: "Tenders", color: "var(--chart-1)" },
} satisfies ChartConfig;

type Row = { status: string; count: number };

function PipelineTooltip({ active, payload }: TooltipContentProps) {
  const row = payload?.[0]?.payload as Row | undefined;
  if (!active || !row) return null;
  return (
    <div className="rounded-[0.5rem] border border-border bg-popover px-3 py-2 text-sm shadow-raised">
      <p className="font-semibold text-foreground">{row.status}</p>
      <p className="mt-0.5 flex items-center gap-2 text-muted-foreground">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
        <span className="tabular-nums">
          {row.count} {row.count === 1 ? "tender" : "tenders"}
        </span>
      </p>
    </div>
  );
}

export function PipelineChart({
  counts,
}: {
  counts: { status: TenderStatus; count: number }[];
}) {
  const data: Row[] = counts.map((row) => ({
    status: TENDER_STATUS_LABEL[row.status],
    count: row.count,
  }));

  return (
    <div>
      <div aria-hidden="true">
        <ChartContainer config={chartConfig} className="aspect-auto h-[17.5rem] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 32, top: 4, bottom: 4 }}
            barCategoryGap={14}
          >
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="status"
              width={92}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 14 }}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", radius: 8 }}
              content={PipelineTooltip}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              barSize={20}
              radius={[0, 4, 4, 0]}
              minPointSize={0}
            >
              <LabelList
                dataKey="count"
                position="right"
                offset={10}
                fill="var(--foreground)"
                fontSize={14}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <table className="sr-only">
        <caption>Tenders in each status</caption>
        <thead>
          <tr>
            <th scope="col">Status</th>
            <th scope="col">Tenders</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.status}>
              <th scope="row">{row.status}</th>
              <td>{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
