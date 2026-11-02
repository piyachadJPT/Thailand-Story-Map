import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import Script from "next/script";
import { ToastContainer } from "react-toastify";
import "./globals.css";

import { siteConfig } from "@/config/site";
import AuthProvider from "@/front/providers/AuthProvider";
import ReactQueryProvider from "@/front/providers/ReactQueryProvider";
import { themeInitScript } from "@/lib/theme";
import { cn } from "@/lib/utils";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={cn("font-sans", kanit.variable)}
    >
      <body className="antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <AuthProvider>
          <ReactQueryProvider>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              toastClassName="!rounded-2xl !font-sans !shadow-lg"
            />
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
