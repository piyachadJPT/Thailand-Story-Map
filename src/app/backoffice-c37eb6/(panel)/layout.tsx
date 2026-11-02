import { redirect } from "next/navigation";
import { getAdminSession } from "@/api/admin/session";
import AdminShell from "@/components/backoffice/AdminShell";
import { backofficeHref } from "@/config/backoffice";

export const dynamic = "force-dynamic";

/** Every panel page needs a valid admin session (checked against the DB). */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const context = await getAdminSession();
  if (!context) redirect(backofficeHref("/login"));
  const { id, name, username, image } = context.user;
  return <AdminShell admin={{ id, name, username, image }}>{children}</AdminShell>;
}
