"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../share/global/navbar";
import Footer from "../share/global/footer";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
    children: ReactNode;
    hideNavbar?: boolean;
    hideFooter?: boolean;
}

export default function MainLayout({
    children,
    hideNavbar = false,
    hideFooter = false,
}: MainLayoutProps) {
    const pathname = usePathname();
    const isMapHome = pathname === "/";

    return (
        <div className="relative flex min-h-[100dvh] flex-col font-sans bg-background">
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="animate-glow-pulse absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
                <div className="animate-glow-pulse absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[120px] dark:bg-primary/10" style={{ animationDelay: "2s" }} />
                <div className="animate-glow-pulse absolute -bottom-40 left-1/3 h-[450px] w-[450px] rounded-full bg-[#1d4e89]/10 blur-[120px] dark:bg-[#00c2ff]/8" style={{ animationDelay: "4s" }} />
            </div>

            {/* Content layer */}
            <div className="relative z-10 flex min-h-[100dvh] flex-col">
                {!hideNavbar && <Navbar />}

                {/* Main content flex-grows to push footer to the bottom */}
                <main
                    className={cn(
                        "flex w-full flex-1 flex-col",
                        isMapHome ? "relative h-dvh overflow-hidden" : "pt-24",
                    )}
                >
                    {children}
                </main>

                {!hideFooter && !isMapHome && <Footer />}
            </div>
        </div>
    );
}
