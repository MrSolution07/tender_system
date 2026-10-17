"use client";

import type { DeskRole } from "@/lib/register";
import { ROLE_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store";
import {
  ChevronDown,
  ClipboardCheck,
  FileText,
  Globe,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: DeskRole[];
};

const NAV: NavItem[] = [
  {
    href: "/desk",
    label: "Pipeline",
    icon: LayoutDashboard,
    roles: ["procurement_officer", "super_admin"],
  },
  {
    href: "/desk/tenders",
    label: "Tenders",
    icon: FileText,
    roles: ["procurement_officer", "evaluator", "super_admin"],
  },
  {
    href: "/desk/reviews",
    label: "Suggestions",
    icon: Sparkles,
    roles: ["procurement_officer", "super_admin"],
  },
  {
    href: "/desk/evaluations",
    label: "Scores",
    icon: ClipboardCheck,
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

function isCurrent(pathname: string, href: string): boolean {
  return href === "/desk"
    ? pathname === "/desk"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.map((part) => part[0]).slice(0, 2).join("");
  return letters.toUpperCase() || "?";
}

function Brand() {
  return (
    <Link
      href="/desk"
      className="flex items-center gap-2.5 rounded-[0.5rem] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-[0.5rem] bg-primary-deep font-display text-base font-semibold text-primary-foreground"
      >
        M
      </span>
      <span className="grid leading-tight">
        <span className="font-display text-base font-semibold text-foreground">
          Major Tech
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          Staff desk
        </span>
      </span>
    </Link>
  );
}

function RoleBadge({ role, className }: { role: DeskRole; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground",
        className,
      )}
    >
      <ShieldCheck className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      {ROLE_LABEL[role]}
    </span>
  );
}

export function DeskShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, session, signOut } = useStore();
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
    <div className="min-h-dvh md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
      <aside
        className="sticky top-0 hidden h-dvh flex-col border-r border-sidebar-border bg-sidebar md:flex"
        aria-label="Desk sidebar"
      >
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Brand />
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
          <DeskNav pathname={pathname} links={links} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <PublicSiteLink />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-4 md:px-8">
          <div className="flex items-center gap-3">
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
              <SheetContent side="left" className="w-72 gap-0 p-0 sm:max-w-72">
                <SheetHeader className="h-16 justify-center border-b border-border px-5 py-0">
                  <SheetTitle className="sr-only">Desk menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Move between desk pages.
                  </SheetDescription>
                  <Brand />
                </SheetHeader>
                <div className="flex flex-1 flex-col px-3 py-5">
                  <DeskNav pathname={pathname} links={links} closeOnNavigate />
                </div>
                <div className="border-t border-border p-3">
                  <PublicSiteLink closeOnNavigate />
                </div>
              </SheetContent>
            </Sheet>
            <div className="md:hidden">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-[0.5rem] bg-primary-deep font-display text-base font-semibold text-primary-foreground"
              >
                M
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RoleBadge role={session.role} className="hidden sm:inline-flex" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 gap-2 px-2 sm:pr-3"
                  aria-label={`Account menu for ${session.name}`}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                  >
                    {initialsOf(session.name)}
                  </span>
                  <span className="hidden text-sm font-medium sm:inline">
                    {session.name}
                  </span>
                  <ChevronDown
                    className="size-4 text-muted-foreground"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="grid gap-0.5 py-2">
                  <span className="text-sm font-semibold text-foreground">
                    {session.name}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {ROLE_LABEL[session.role]}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    void signOut().then(() => router.push("/desk/sign-in"));
                  }}
                >
                  <LogOut strokeWidth={1.5} aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div
          role="status"
          className="border-b border-primary/20 bg-secondary px-4 py-3 md:px-8"
        >
          <div className="flex items-start gap-3">
            <Info
              className="mt-0.5 size-5 shrink-0 text-primary"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <p className="text-pretty text-sm text-foreground">
              You are {session.name}, {ROLE_LABEL[session.role]}.
            </p>
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLinkWrap({
  closeOnNavigate,
  children,
}: {
  closeOnNavigate?: boolean;
  children: ReactNode;
}) {
  return closeOnNavigate ? <SheetClose asChild>{children}</SheetClose> : <>{children}</>;
}

function PublicSiteLink({ closeOnNavigate }: { closeOnNavigate?: boolean }) {
  return (
    <NavLinkWrap closeOnNavigate={closeOnNavigate}>
      <Link
        href="/"
        className="flex min-h-11 items-center gap-3 rounded-[0.5rem] px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Globe className="size-5" strokeWidth={1.5} aria-hidden="true" />
        Public site
      </Link>
    </NavLinkWrap>
  );
}

function DeskNav({
  pathname,
  links,
  closeOnNavigate,
}: {
  pathname: string;
  links: NavItem[];
  closeOnNavigate?: boolean;
}) {
  return (
    <nav className="grid gap-1" aria-label="Desk">
      {links.map((link) => {
        const current = isCurrent(pathname, link.href);
        const Icon = link.icon;
        return (
          <NavLinkWrap key={link.href} closeOnNavigate={closeOnNavigate}>
            <Link
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 items-center gap-3 rounded-[0.5rem] px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                current
                  ? "bg-secondary font-semibold text-primary-deep before:absolute before:inset-y-2 before:-left-3 before:w-1 before:rounded-r-full before:bg-primary"
                  : "font-medium text-foreground hover:bg-muted",
              )}
            >
              <Icon
                className={cn("size-5", current ? "text-primary" : "text-muted-foreground")}
                strokeWidth={current ? 1.75 : 1.5}
                aria-hidden="true"
              />
              {link.label}
            </Link>
          </NavLinkWrap>
        );
      })}
    </nav>
  );
}
