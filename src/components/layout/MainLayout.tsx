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
    <div
      className={cn(
        "relative flex min-h-[100dvh] flex-col bg-background font-sans",
        !isMapHome && "page-canvas",
      )}
    >
      {!hideNavbar && <Navbar />}

      <main
        className={cn(
          "relative z-10 flex w-full flex-1 flex-col",
          isMapHome ? "h-dvh overflow-hidden" : "pt-24",
        )}
      >
        {children}
      </main>

      {!hideFooter && !isMapHome && <Footer />}
    </div>
  );
}
