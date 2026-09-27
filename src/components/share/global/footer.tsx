import Link from "next/link";
import { siteConfig } from "@/config/site";
import { MapPin, Github, Heart } from "lucide-react";

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
        <footer className="relative w-full overflow-hidden border-t border-border bg-card dark:bg-background">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[100px] dark:bg-primary/8" />
                <div className="absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-[#1d4e89]/10 blur-[100px] dark:bg-primary/10" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-5">
                    {/* Brand section */}
                    <div className="space-y-6 lg:col-span-2">
                        <Link href="/" className="group inline-flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 group-hover:shadow-primary/30 group-hover:scale-110">
                                <MapPin className="h-5 w-5" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                {siteConfig.name}
                            </span>
                        </Link>
                        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                            {siteConfig.description}
                        </p>

                        {/* Social links */}
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 hover:scale-110"
                                aria-label="GitHub"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Link sections */}
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
                        {footerSections.map((section) => (
                            <div key={section.title}>
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
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

                {/* Bottom bar */}
                <div className="mt-16 flex flex-col items-center gap-4 border-t border-border pt-8 sm:flex-row sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        &copy; {currentYear} {siteConfig.name}. All rights reserved.
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        Made with
                        <Heart className="inline h-3 w-3 animate-pulse text-primary" />
                        in Thailand 🇹🇭
                    </p>
                </div>
            </div>
        </footer>
    );
}
