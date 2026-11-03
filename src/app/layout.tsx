import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
import Script from "next/script";
import { ToastContainer } from "react-toastify";
import "./globals.css";

import { siteConfig } from "@/config/site";
import AuthProvider from "@/front/providers/AuthProvider";
import ReactQueryProvider from "@/front/providers/ReactQueryProvider";
import JsonLd from "@/components/seo/JsonLd";
import { siteJsonLd } from "@/lib/seo/jsonld";
import { themeInitScript } from "@/lib/theme";
import { cn } from "@/lib/utils";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  // Only the weights the UI uses (font-normal/medium/semibold/bold).
  weight: ["400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});

const DEFAULT_TITLE =
  "แผนที่เรื่องเล่าประเทศไทย — ตำนาน เรื่องลี้ลับ ประวัติศาสตร์ ทั่ว 77 จังหวัด";

const verificationOther: Record<string, string> = {};
if (process.env.BING_SITE_VERIFICATION) {
  verificationOther["msvalidate.01"] = process.env.BING_SITE_VERIFICATION;
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: DEFAULT_TITLE,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(Object.keys(verificationOther).length ? { other: verificationOther } : {}),
  },
};

/** Browser UI color follows the page background (--background) in each theme. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1117" },
  ],
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
        <JsonLd data={siteJsonLd()} />
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
