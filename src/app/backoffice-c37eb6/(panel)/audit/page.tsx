import type { Metadata } from "next";
import AuditView from "@/components/backoffice/audit/AuditView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "บันทึกการทำงาน", robots: { index: false, follow: false } };

export default function AuditPage() {
  return <AuditView />;
}
