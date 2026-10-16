"use client";

import { useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a work email.");
      return;
    }
    if (!password) {
      setError("Enter the password.");
      return;
    }
    setPending(true);
    const message = await signIn(email, password);
    setPending(false);
    if (message) {
      setError(message);
      return;
    }
    router.push("/desk");
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section className="bg-primary-deep px-6 py-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
        <div className="flex items-center gap-3">
          <MarkTile className="size-10 bg-primary-foreground text-lg text-primary-deep" />
          <span className="font-display text-lg font-semibold">Major Tech</span>
        </div>
        <div className="mt-10 lg:mt-0">
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold leading-tight lg:text-5xl">
            Open the desk
          </h1>
          <p className="mt-4 max-w-md text-pretty text-base text-primary-foreground/85">
            Staff sign in to draft tenders, score bids, and review suggestions.
            The public site only shows what may be published.
          </p>
        </div>
        <p className="mt-10 hidden text-sm text-primary-foreground/75 lg:block">
          Government Tender Intelligence and Transparency Platform
        </p>
      </section>

      <main className="flex flex-col justify-center px-6 py-10 lg:px-16">
        <form onSubmit={(event) => void submit(event)} className="mx-auto w-full max-w-md">
          <h2 className="font-display text-2xl font-semibold">Sign in</h2>
          <label className="mt-6 grid gap-2 text-sm font-semibold" htmlFor="work-email">
            Work email
            <input
              id="work-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-[0.5rem] border border-border bg-card px-3 text-base font-normal"
            />
          </label>
          <label className="mt-4 grid gap-2 text-sm font-semibold" htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-[0.5rem] border border-border bg-card px-3 text-base font-normal"
            />
          </label>
          {error ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-6 h-11 w-full rounded-[0.5rem] bg-primary-deep text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {pending ? "Signing in" : "Sign in"}
          </button>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-[0.5rem] text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Back to the public record
          </Link>
        </form>
      </main>
    </div>
  );
}
