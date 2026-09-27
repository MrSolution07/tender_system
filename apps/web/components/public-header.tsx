"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/tenders", label: "Tenders" },
  { href: "/awards", label: "Awards" },
  { href: "/desk/sign-in", label: "Desk" },
];

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/desk/sign-in") return pathname.startsWith("/desk");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="font-display text-lg font-semibold text-foreground">
          Major Tech
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Public">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm",
                isCurrent(pathname, link.href)
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
              aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
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
            <nav className="mt-6 grid gap-1" aria-label="Public">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-base"
                  aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
