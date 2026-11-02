"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../share/global/navbar";
import Footer from "../share/global/footer";
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
          isMapHome ? "h-dvh overflow-hidden" : "pt-24"
        )}
      >
        {children}
      </main>

      {!isMapHome && <Footer />}
    </div>
  );
}
