import type { ReactNode } from "react";
import { PublicHeader } from "@/components/public-header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <p className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
          Sample register. Not a live procurement system, and not a bank.
        </p>
      </footer>
    </div>
  );
}
