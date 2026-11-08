import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { GoldDivider } from "@/components/ui/gold-divider";
import { siteConfig } from "@/config/site";
import FooterColumn from "./FooterColumn";

const footerSections = [
  {
    title: "สำรวจ",
    links: [
      { name: "แผนที่เรื่องเล่า", href: "/" },
      { name: "สำรวจ", href: "/categories" },
      { name: "เรื่องเล่า 77 จังหวัด", href: "/province" },
      { name: "เรื่องราวใหม่", href: "/contribute" },
    ],
  },
  {
    title: "ชุมชน",
    links: [
      { name: "เกี่ยวกับเรา", href: "/about" },
      { name: "ติดต่อทีมงาน", href: "/about#contact" },
    ],
  },
  {
    title: "กฎหมาย",
    links: [
      { name: "ความเป็นส่วนตัว", href: "/privacy" },
      { name: "ข้อกำหนดบริการ", href: "/terms" },
      { name: "คุกกี้", href: "/privacy#cookies" },
    ],
  },
] as const;

/** Only profiles that exist (siteConfig.social) get an icon. */
const socialLinks = [
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "x", label: "X", icon: Twitter },
  { key: "instagram", label: "Instagram", icon: Instagram },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const profiles = socialLinks.flatMap((link) => {
    const href = siteConfig.social[link.key];
    return href ? [{ ...link, href }] : [];
  });

  return (
    <footer className="relative z-10 w-full border-t border-border bg-card">
      <GoldDivider pattern="lai" strength="subtle" className="-mt-1.25" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center gap-3 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid size-11 place-items-center overflow-hidden rounded-full bg-background ring-1 ring-gold/60">
                <Image
                  src="/logo.png"
                  alt=""
                  width={36}
                  height={36}
                  className="size-8 object-contain"
                />
              </span>
              <span className="leading-tight">
                <span className="block font-heading text-lg font-bold text-foreground">
                  {siteConfig.nameTh}
                </span>
                <span className="block text-[0.625rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  {siteConfig.name}
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
            {profiles.length ? (
              <div className="flex gap-2">
                {profiles.map(({ key, label, href, icon: Icon }) => (
                  <a
                    key={key}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-grid size-11 place-items-center rounded-control border border-border text-muted-foreground outline-none transition-colors hover:border-gold hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            {footerSections.map((section) => (
              <FooterColumn
                key={section.title}
                title={section.title}
                links={section.links}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            &copy; {currentYear} {siteConfig.name} · สงวนลิขสิทธิ์
          </p>
          <p>สร้างในประเทศไทย</p>
        </div>
      </div>
    </footer>
  );
}
