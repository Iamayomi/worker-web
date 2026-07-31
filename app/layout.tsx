import type { Metadata, Viewport } from "next";
import { Caveat, JetBrains_Mono, Raleway } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { cn } from "@/lib/utils";

import "./globals.css";
import { jsonLd, seoMetadata } from "@/lib/seo";
import { isDevelopment } from "@/lib/constants";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  fallback: ["Arial"],
  variable: "--font-raleway",
});

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
});

export const metadata: Metadata = seoMetadata;

export const viewport: Viewport = {
  userScalable: false,
  maximumScale: 1.0,
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(
        "h-full scroll-smooth antialiased",
        raleway.variable,
        jetbrainsMono.variable,
        caveat.variable
      )}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body className="min-h-full text-foreground pb-16 lg:pb-0">
        <ThemeProvider>
          <SiteNav />
          {children}
          <SiteFooter />
          <BottomNav />
        </ThemeProvider>
        <SpeedInsights />
        {!isDevelopment ? (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id="c64060f6-5f22-4e12-955d-6925f903afcf"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
