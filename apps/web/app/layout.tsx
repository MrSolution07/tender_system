import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Major Tech",
    template: "%s · Major Tech",
  },
  description:
    "Published tender notices and awards from the Major Tech register.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${sourceSans.variable} h-full`}
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
