"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownToLine, Banknote, FileBarChart, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatRand } from "@/lib/format";
import { useStore } from "@/lib/store";

function csvCell(value: string | number): string {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { tenders, awards } = useStore();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tenders;
    return tenders.filter((tender) =>
      [tender.title, tender.department, tender.category, tender.status].some((field) =>
        field.toLowerCase().includes(term),
      ),
    );
  }, [query, tenders]);

  const totalBudget = tenders.reduce((sum, tender) => sum + tender.budgetCents, 0);
  const awarded = tenders.filter((tender) => tender.status === "awarded" || tender.status === "completed");
  const awardedBudget = awarded.reduce((sum, tender) => sum + tender.budgetCents, 0);
  const totalSpend = awards.reduce(
    (sum, award) => sum + award.spend.reduce((spendSum, line) => spendSum + line.amountCents, 0),
    0,
  );

  function exportTenders() {
    downloadCsv("major-tech-tender-register.csv", [
      ["Tender ID", "Tender title", "Department", "Category", "Status", "Budget (ZAR)", "Closing date"],
      ...filtered.map((tender) => [
        tender.id,
        tender.title,
        tender.department,
        tender.category,
        tender.status,
        (tender.budgetCents / 100).toFixed(2),
        tender.closingAt ? formatDate(tender.closingAt) : "Not set",
      ]),
    ]);
  }

  function exportAwards() {
    downloadCsv("major-tech-awards-and-expenditure.csv", [
      ["Award ID", "Project", "Contractor", "Award date", "Project status", "Progress (%)", "Location", "Recorded spend (ZAR)"],
      ...awards.map((award) => [
        award.id,
        award.projectTitle,
        award.contractor,
        formatDate(award.awardedAt),
        award.projectStatus,
        award.progressPercent,
        award.locationLabel,
        (award.spend.reduce((sum, line) => sum + line.amountCents, 0) / 100).toFixed(2),
      ]),
    ]);
  }

  const metrics = [
    { label: "Tender register value", value: formatRand(totalBudget), note: `${tenders.length} tenders in the register`, icon: FileText },
    { label: "Awarded & completed", value: formatRand(awardedBudget), note: `${awarded.length} tenders in these stages`, icon: Banknote },
    { label: "Recorded project spend", value: formatRand(totalSpend), note: "Sum of sample expenditure lines", icon: FileBarChart },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-primary-deep px-6 py-7 text-primary-foreground shadow-raised md:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Transparency centre</span>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Reports & analytics</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Review tender values, awarded projects and recorded expenditure. Export the current sample register for further analysis.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={exportTenders} className="h-11 bg-white text-primary-deep hover:bg-white/90"><ArrowDownToLine className="mr-2 size-4" /> Export tender CSV</Button>
            <Button onClick={exportAwards} variant="outline" className="h-11 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"><ArrowDownToLine className="mr-2 size-4" /> Export awards CSV</Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map(({ label, value, note, icon: Icon }) => (
          <section key={label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-3 font-display text-2xl font-semibold tracking-tight text-primary-deep md:text-3xl">{value}</p><p className="mt-2 text-sm text-muted-foreground">{note}</p></div>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-5" /></span>
            </div>
          </section>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div><h2 className="font-display text-xl font-semibold">Tender register</h2><p className="mt-1 text-sm text-muted-foreground">Search, review and export tender records.</p></div>
          <div className="relative w-full md:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, department or status" className="h-11 pl-9" aria-label="Search tender reports" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-6 py-3 font-semibold">Tender</th><th className="px-4 py-3 font-semibold">Department</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Budget</th><th className="px-6 py-3 text-right font-semibold">Closing date</th></tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map((tender) => <tr key={tender.id} className="transition-colors hover:bg-muted/30"><td className="px-6 py-4"><Link href={`/desk/tenders/${tender.id}`} className="font-semibold text-foreground hover:text-primary hover:underline">{tender.title}</Link><span className="mt-1 block text-xs text-muted-foreground">{tender.category} · {tender.id}</span></td><td className="px-4 py-4 text-muted-foreground">{tender.department}</td><td className="px-4 py-4"><StatusBadge status={tender.status} /></td><td className="px-4 py-4 text-right font-semibold tabular-nums">{formatRand(tender.budgetCents)}</td><td className="px-6 py-4 text-right tabular-nums text-muted-foreground">{tender.closingAt ? formatDate(tender.closingAt) : "Not set"}</td></tr>)}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No tenders match your search. Try another keyword.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-6 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Showing {filtered.length} of {tenders.length} tenders · Values use sample data.</span><Button variant="outline" className="h-10" onClick={exportTenders}><ArrowDownToLine className="mr-2 size-4" /> Download filtered CSV</Button></div>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">Demonstration notice: these figures are sample project data stored in this browser. They are not live government procurement records or audited financial statements.</p>
    </div>
  );
}
