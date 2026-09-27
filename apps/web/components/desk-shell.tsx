"use client";

import type { DeskRole } from "@/lib/sample-data";
import { ROLE_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; roles: DeskRole[] }[] = [
  { href: "/desk", label: "Pipeline", roles: ["procurement_officer", "super_admin"] },
  {
    href: "/desk/tenders",
    label: "Tenders",
    roles: ["procurement_officer", "evaluator", "super_admin"],
  },
  {
    href: "/desk/reviews",
    label: "Suggestions",
    roles: ["procurement_officer", "super_admin"],
  },
  {
    href: "/desk/evaluations",
    label: "Scores",
    roles: ["evaluator", "super_admin"],
  },
];

function homeFor(role: DeskRole): string {
  return role === "evaluator" ? "/desk/evaluations" : "/desk";
}

function canSee(role: DeskRole, pathname: string): boolean {
  if (pathname === "/desk/sign-in") return true;
  const match = NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (!match) return true;
  return match.roles.includes(role);
}

export function DeskShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, session, signOut, resetSample } = useStore();
  const onSignIn = pathname === "/desk/sign-in";

  useEffect(() => {
    if (!ready) return;
    if (!session && !onSignIn) {
      router.replace("/desk/sign-in");
      return;
    }
    if (session && onSignIn) {
      router.replace(homeFor(session.role));
      return;
    }
    if (session && !canSee(session.role, pathname)) {
      router.replace(homeFor(session.role));
    }
  }, [ready, session, onSignIn, pathname, router]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (!session || onSignIn) {
    return <>{children}</>;
  }

  const links = NAV.filter((item) => item.roles.includes(session.role));

  return (
    <div className="min-h-dvh">
      <div className="bg-primary text-primary-foreground">
        <p className="mx-auto max-w-6xl px-6 py-2 text-sm">
          Preview — not a real sign-in. You are {session.name},{" "}
          {ROLE_LABEL[session.role]}.
        </p>
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-6 md:grid-cols-[12rem_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <p className="font-display text-lg font-semibold">Desk</p>
          <DeskNav pathname={pathname} links={links} />
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between gap-3 md:justify-end">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11 md:hidden"
                  aria-label="Open desk menu"
                >
                  <Menu strokeWidth={1.5} aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="font-display">Desk</SheetTitle>
                </SheetHeader>
                <DeskNav pathname={pathname} links={links} />
              </SheetContent>
            </Sheet>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11">
                  {session.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    resetSample();
                    router.push("/desk/sign-in");
                  }}
                >
                  Reset sample data
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    signOut();
                    router.push("/desk/sign-in");
                  }}
                >
                  Leave preview
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function DeskNav({
  pathname,
  links,
}: {
  pathname: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav className="mt-4 grid gap-1" aria-label="Desk">
      {links.map((link) => {
        const current =
          link.href === "/desk"
            ? pathname === "/desk"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              current ? "bg-secondary font-semibold text-secondary-foreground" : "text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <Link href="/" className="rounded-lg px-3 py-2 text-sm text-muted-foreground">
        Public site
      </Link>
    </nav>
  );
}
