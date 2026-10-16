"use client";

import { ROLE_LABEL } from "@/lib/labels";
import type { DeskRole } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Info,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ROLES: { role: DeskRole; icon: LucideIcon; blurb: string }[] = [
  {
    role: "procurement_officer",
    icon: ClipboardList,
    blurb: "Draft tenders, move their status and review AI suggestions.",
  },
  {
    role: "evaluator",
    icon: Scale,
    blurb: "Score assigned bids. Scores stay off the public site.",
  },
  {
    role: "super_admin",
    icon: ShieldCheck,
    blurb: "Sees the same desk as an officer in this preview.",
  },
];

function MarkTile({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center rounded-[0.5rem] font-display font-semibold ${className ?? ""}`}
    >
      M
    </span>
  );
}

export default function SignInPage() {
  const { signIn } = useStore();
  const router = useRouter();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section className="bg-primary-deep px-6 py-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
        <div className="flex items-center gap-3">
          <MarkTile className="size-10 bg-primary-foreground text-lg text-primary-deep" />
          <span className="font-display text-lg font-semibold">Major Tech</span>
        </div>
        <div className="mt-10 lg:mt-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/80">
            Staff desk
          </p>
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold leading-tight lg:text-5xl">
            Open the desk
          </h1>
          <p className="mt-4 max-w-md text-pretty text-base text-primary-foreground/85">
            Walk the sample tender register as an officer, an evaluator or an
            admin. The public site only ever shows what may be published.
          </p>
        </div>
        <p className="mt-10 hidden text-sm text-primary-foreground/75 lg:block">
          Government Tender Intelligence and Transparency Platform
        </p>
      </section>

      <main className="flex flex-col justify-center px-6 py-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div
            role="note"
            className="flex items-start gap-3 rounded-[1rem] border border-primary/20 bg-secondary p-4"
          >
            <Info
              className="mt-0.5 size-5 shrink-0 text-primary"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <p className="text-pretty text-sm text-foreground">
              <strong className="font-semibold text-primary-deep">
                Preview, not a real sign-in.
              </strong>{" "}
              No password is checked and no account is created.
            </p>
          </div>

          <h2 className="mt-8 font-display text-2xl font-semibold">
            Choose a role
          </h2>
          <ul className="mt-4 grid gap-3">
            {ROLES.map(({ role, icon: Icon, blurb }) => (
              <li key={role}>
                <button
                  type="button"
                  onClick={() => {
                    signIn(role);
                    router.push(role === "evaluator" ? "/desk/evaluations" : "/desk");
                  }}
                  className="group flex min-h-16 w-full items-center gap-4 rounded-[1rem] border border-border bg-card p-4 text-left shadow-card outline-none transition-[box-shadow,border-color,transform] duration-150 hover:border-primary hover:shadow-raised focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-[0.5rem] bg-secondary text-primary">
                    <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="grid flex-1 gap-0.5">
                    <span className="text-base font-semibold text-foreground">
                      {ROLE_LABEL[role]}
                    </span>
                    <span className="text-pretty text-sm text-muted-foreground">
                      {blurb}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-5 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>

          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-[0.5rem] text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Back to the public record
          </Link>
        </div>
      </main>
    </div>
  );
}
