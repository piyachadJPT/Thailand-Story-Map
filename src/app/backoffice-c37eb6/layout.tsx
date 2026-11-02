import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { template: "%s · Backoffice", default: "Backoffice" },
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

/** Backoffice root: no public navbar or footer. */
export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-background font-sans text-foreground">{children}</div>;
}
