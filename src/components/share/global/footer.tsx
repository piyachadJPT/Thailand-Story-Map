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
                { name: "สร้างเรื่องใหม่", href: "/create" },
                { name: "เรื่องยอดนิยม", href: "#" },
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
        <footer className="relative w-full overflow-hidden border-t border-purple-100 bg-white dark:border-white/5 dark:bg-zinc-950">
            {/* Background gradient glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-[100px] dark:bg-purple-500/5" />
                <div className="absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-pink-500/8 blur-[100px] dark:bg-pink-500/5" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-5">
                    {/* Brand section */}
                    <div className="space-y-6 lg:col-span-2">
                        <Link href="/" className="group inline-flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 shadow-lg shadow-purple-500/25 transition-all duration-300 group-hover:shadow-purple-500/40 group-hover:scale-110">
                                <MapPin className="h-5 w-5 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {siteConfig.name}
                            </span>
                        </Link>
                        <p className="max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                            {siteConfig.description}
                        </p>

                        {/* Social links */}
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-110 dark:bg-white/5 dark:text-zinc-400"
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
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                    {section.title}
                                </h3>
                                <ul role="list" className="mt-5 space-y-3.5">
                                    {section.links.map((link) => (
                                        <li key={link.name}>
                                            <a
                                                href={link.href}
                                                className="group text-sm text-zinc-500 transition-all duration-200 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400"
                                            >
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="h-1 w-1 rounded-full bg-zinc-300 transition-all duration-200 group-hover:w-2 group-hover:bg-purple-500 dark:bg-zinc-600 dark:group-hover:bg-purple-400" />
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
                <div className="mt-16 flex flex-col items-center gap-4 border-t border-purple-100 pt-8 sm:flex-row sm:justify-between dark:border-white/5">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        &copy; {currentYear} {siteConfig.name}. All rights reserved.
                    </p>
                    <p className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                        Made with
                        <Heart className="inline h-3 w-3 animate-pulse text-pink-500" />
                        in Thailand 🇹🇭
                    </p>
                </div>
            </div>
        </footer>
    );
}
