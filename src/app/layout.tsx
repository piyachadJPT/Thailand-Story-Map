import type { Metadata, Viewport } from "next";
import { Kanit, Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "./globals.css";

import { siteConfig } from "@/config/site";
import AuthProvider from "@/front/providers/AuthProvider";
import ReactQueryProvider from "@/front/providers/ReactQueryProvider";
import JsonLd from "@/components/seo/JsonLd";
import { siteJsonLd } from "@/lib/seo/jsonld";
import { themeInitScript } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Public site headings: looped Thai serif. */
const notoSerifThai = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-serif-thai",
  display: "swap",
});

/** Public site body and UI text. */
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-thai",
  display: "swap",
});

/** Backoffice only. Browsers fetch it only on pages that render it. */
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
  preload: false,
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

/** Browser UI color matches the top nav bar (--nav) in each theme. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#24365a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d0a" },
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
      className={cn("font-sans", notoSerifThai.variable, notoSansThai.variable, kanit.variable)}
    >
      <head>
        {/*
          Plain inline script, not next/script: it must run while the HTML is
          parsed, before the first paint, or a saved dark mode flashes light.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <JsonLd data={siteJsonLd()} />
        <AuthProvider>
          <ReactQueryProvider>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              toastClassName="!rounded-md !font-sans !shadow-none !border !border-border"
            />
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
