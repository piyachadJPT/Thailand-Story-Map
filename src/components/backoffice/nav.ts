import {
  FileText,
  Flag,
  History,
  LayoutDashboard,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { backofficeHref } from "@/config/backoffice";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: "pending" | "openReports";
};

export const navGroups: { label: string; items: NavItem[] }[] = [
  { label: "ภาพรวม", items: [{ label: "Dashboard", href: backofficeHref(), icon: LayoutDashboard }] },
  {
    label: "การตรวจสอบ",
    items: [
      { label: "เรื่อง", href: backofficeHref("/stories"), icon: FileText, badge: "pending" },
      { label: "รายงาน", href: backofficeHref("/reports"), icon: Flag, badge: "openReports" },
    ],
  },
  { label: "ชุมชน", items: [{ label: "ผู้ใช้", href: backofficeHref("/users"), icon: Users }] },
  {
    label: "ระบบ",
    items: [
      { label: "บันทึกการทำงาน", href: backofficeHref("/audit"), icon: History },
      { label: "บัญชีของฉัน", href: backofficeHref("/account"), icon: UserCog },
    ],
  },
];

export const navItems = navGroups.flatMap((group) => group.items);

export function isActive(pathname: string, href: string) {
  return href === backofficeHref() ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Breadcrumb trail for the current path. */
export function breadcrumbFor(pathname: string) {
  const crumbs: { label: string; href?: string }[] = [{ label: "Backoffice", href: backofficeHref() }];
  const section = navItems.find((item) => item.href !== backofficeHref() && isActive(pathname, item.href));
  if (!section) {
    crumbs.push({ label: "Dashboard" });
    return crumbs;
  }
  const isDetail = pathname !== section.href;
  crumbs.push({ label: section.label, href: isDetail ? section.href : undefined });
  if (isDetail) crumbs.push({ label: "รายละเอียด" });
  return crumbs;
}
