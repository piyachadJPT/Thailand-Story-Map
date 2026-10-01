import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Github, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "สำรวจ",
      links: [
        { name: "แผนที่เรื่องเล่า", href: "/" },
        { name: "สำรวจ", href: "/categories" },
        { name: "เรื่องราวใหม่", href: "/contact" },
      ],
    },
    {
      title: "ชุมชน",
      links: [
        { name: "เกี่ยวกับเรา", href: "#" },
        { name: "ติดต่อทีมงาน", href: "#" },
        { name: "บล็อก", href: "#" },
      ],
    },
    {
      title: "กฎหมาย",
      links: [
        { name: "ความเป็นส่วนตัว", href: "#" },
        { name: "ข้อกำหนดบริการ", href: "#" },
        { name: "คุกกี้", href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative z-10 w-full overflow-hidden border-t border-border/80 bg-card/60 backdrop-blur-xl dark:bg-background/80">
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-background ring-1 ring-foreground/8 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt=""
                  width={40}
                  height={40}
                  className="h-9 w-9 object-contain"
                />
              </span>
              <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
                {siteConfig.name}
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>

            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-[0.7rem] font-semibold tracking-[0.18em] text-primary uppercase">
                  {section.title}
                </h3>
                <ul role="list" className="mt-5 space-y-3.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="group text-sm text-muted-foreground transition-all duration-200 hover:text-primary"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-border transition-all duration-200 group-hover:w-2 group-hover:bg-primary" />
                          {link.name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 border-t border-border pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} {siteConfig.name} · สงวนลิขสิทธิ์
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            สร้างด้วย
            <Heart className="inline h-3 w-3 animate-pulse text-primary" />
            ในประเทศไทย 🇹🇭
          </p>
        </div>
      </div>
    </footer>
  );
}
