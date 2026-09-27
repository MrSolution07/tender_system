"use client";

import { ROLE_LABEL } from "@/lib/labels";
import type { DeskRole } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const ROLES: DeskRole[] = ["procurement_officer", "evaluator", "super_admin"];

export default function SignInPage() {
  const { signIn } = useStore();
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="font-display text-balance text-4xl font-semibold">
        Open the desk
      </h1>
      <p className="mt-4 text-pretty text-muted-foreground">
        Pick a role to walk the sample register. This does not check a password
        and does not create an account.
      </p>
      <div className="mt-8 grid gap-3">
        {ROLES.map((role) => (
          <Button
            key={role}
            variant="outline"
            className="h-11 justify-start px-4"
            onClick={() => {
              signIn(role);
              router.push(role === "evaluator" ? "/desk/evaluations" : "/desk");
            }}
          >
            {ROLE_LABEL[role]}
          </Button>
        ))}
      </div>
      <Link href="/" className="mt-8 text-sm font-semibold text-primary">
        Back to the public record
      </Link>
    </div>
  );
}
