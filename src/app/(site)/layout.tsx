import MainLayout from "@/components/layout/MainLayout";

/** Public site: navbar + footer around every page in this group. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
