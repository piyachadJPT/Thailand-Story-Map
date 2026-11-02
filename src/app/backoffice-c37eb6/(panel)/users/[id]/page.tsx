import type { Metadata } from "next";
import UserDetailView from "@/components/backoffice/users/UserDetailView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ผู้ใช้", robots: { index: false, follow: false } };

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailView id={id} />;
}
