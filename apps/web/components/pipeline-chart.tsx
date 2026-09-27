"use client";

import type { TenderStatus } from "@tender/shared";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { TENDER_STATUS_LABEL } from "@/lib/labels";

const chartConfig = {
  count: { label: "Tenders", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function PipelineChart({
  counts,
}: {
  counts: { status: TenderStatus; count: number }[];
}) {
  const data = counts.map((row) => ({
    status: TENDER_STATUS_LABEL[row.status],
    count: row.count,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="status" tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={6} />
      </BarChart>
    </ChartContainer>
  );
}
