"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../share/global/navbar/Navbar";
import Footer from "../share/global/footer/Footer";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isMapHome = pathname === "/";

  return (
    <div
      className={cn(
        "bg-background relative flex min-h-[100dvh] flex-col font-sans",
        !isMapHome && "page-canvas"
      )}
    >
      <Navbar />

      <main
        className={cn(
          "relative z-10 flex w-full flex-1 flex-col",
          isMapHome ? "h-dvh overflow-hidden" : "pt-[calc(var(--nav-h)+1.5rem)]"
        )}
      >
        {children}
      </main>

      {!isMapHome && <Footer />}
    </div>
  );
}
