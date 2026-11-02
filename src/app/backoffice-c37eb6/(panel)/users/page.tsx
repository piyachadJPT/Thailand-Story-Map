import type { Metadata } from "next";
import UsersView from "@/components/backoffice/users/UsersView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ผู้ใช้", robots: { index: false, follow: false } };

export default function UsersPage() {
  return <UsersView />;
}
