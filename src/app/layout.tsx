import type { Metadata } from "next";
import { Noto_Sans_Thai, Geist } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "./globals.css";

import { siteConfig } from "@/config/site";
import ReactQueryProvider from "@/front/providers/ReactQueryProvider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const notoThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-thai",
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
    <html lang="th" className={cn("font-sans", geist.variable)}>
      <body
        className={`${notoThai.variable} antialiased`}
      >
        <ReactQueryProvider>
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
