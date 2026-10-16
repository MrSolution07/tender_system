"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/tenders", label: "Tenders" },
  { href: "/awards", label: "Awards" },
];

function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 font-display text-lg font-semibold text-foreground"
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-[0.5rem] bg-primary-deep text-base font-semibold text-primary-foreground"
      >
        M
      </span>
      Major Tech
    </Link>
  );
}

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Wordmark />
        <nav className="hidden h-full items-center gap-8 md:flex" aria-label="Public">
          {links.map((link) => {
            const current = isCurrent(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "relative flex h-full items-center text-sm font-medium transition-colors hover:text-foreground",
                  current
                    ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Button asChild variant="outline" className="h-10 px-4">
            <Link href="/desk/sign-in">Staff desk</Link>
          </Button>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-11 md:hidden"
              aria-label="Open menu"
            >
              <Menu strokeWidth={1.5} aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="font-display">Major Tech</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 grid gap-1 px-4" aria-label="Public">
              {links.map((link) => {
                const current = isCurrent(pathname, link.href);
                return (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "rounded-lg px-3 py-3 text-base",
                        current
                          ? "bg-secondary font-semibold text-secondary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                );
              })}
              <SheetClose asChild>
                <Link
                  href="/desk/sign-in"
                  className="mt-4 rounded-lg border border-border px-3 py-3 text-base"
                >
                  Staff desk
                </Link>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
