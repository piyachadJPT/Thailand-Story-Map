import Image from "next/image";
import Link from "next/link";
import { Facebook, Heart, Instagram, Twitter } from "lucide-react";
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
    <footer className="relative z-10 w-full bg-card/60 backdrop-blur-xl">
      <GoldDivider />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <Link
              href="/"
              prefetch={false}
              className="group inline-flex items-center gap-3 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <span className="grid size-12 place-items-center overflow-hidden rounded-full bg-background ring-1 ring-gold/50 transition-shadow group-hover:ring-gold">
                <Image
                  src="/logo.png"
                  alt=""
                  width={40}
                  height={40}
                  className="size-9 object-contain"
                />
              </span>
              <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
                {siteConfig.name}
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
                    className="inline-grid size-11 place-items-center rounded-full border border-border text-muted-foreground outline-none transition-colors hover:border-gold/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
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

        <GoldDivider strength="subtle" className="mt-14" />
        <div className="flex flex-col items-center gap-3 pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            &copy; {currentYear} {siteConfig.name} · สงวนลิขสิทธิ์
          </p>
          <p className="flex items-center gap-1">
            สร้างด้วย
            <Heart
              aria-hidden="true"
              className="inline size-3 fill-gold text-gold motion-safe:animate-pulse"
            />
            ในประเทศไทย 🇹🇭
          </p>
        </div>
      </div>
    </footer>
  );
}
