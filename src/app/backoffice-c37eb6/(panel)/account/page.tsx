import type { Metadata } from "next";
import AccountView from "@/components/backoffice/account/AccountView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "บัญชีของฉัน", robots: { index: false, follow: false } };

export default function AccountPage() {
  return <AccountView />;
}
