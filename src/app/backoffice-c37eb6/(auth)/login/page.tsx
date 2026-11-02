import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasAnyAdmin } from "@/api/admin/account";
import { getAdminSession } from "@/api/admin/session";
import LoginScreen from "@/components/backoffice/login/LoginScreen";
import { BACKOFFICE_PATH } from "@/config/backoffice";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "เข้าสู่ระบบ", robots: { index: false, follow: false } };

async function noAdminsYet() {
  if (process.env.NODE_ENV === "production") return false;
  try {
    return !(await hasAnyAdmin());
  } catch {
    return false;
  }
}

export default async function BackofficeLoginPage() {
  const session = await getAdminSession().catch(() => null);
  if (session) redirect(BACKOFFICE_PATH);
  return <LoginScreen showSetupHint={await noAdminsYet()} />;
}
