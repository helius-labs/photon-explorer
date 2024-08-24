import { ClusterProvider } from "@/providers/cluster-provider";
import { ReactQueryClientProvider } from "@/providers/query-client-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { cn } from "@/utils/common";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter as Fontface } from "next/font/google";
import { Suspense } from "react";

import "./globals.css";

const fontface = Fontface({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XRAY Beta",
  description: "",
  icons: [
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon/xray-icon.png",
    },
    {
      rel: "apple-touch-icon",
      url: "/favicon/xray-icon.png",
    },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={cn(
          "flex min-h-screen flex-col bg-background antialiased",
          fontface.className,
        )}
      >
        <div className="relative top-0 z-[-1]">
        <div className="absolute bottom-auto left-0 right-0 top-0 mt-[-60px] block h-[720px] w-full dark:bg-[radial-gradient(circle_closest-corner_at_50%_-40%,#38383d,rgba(5,5,5,0)_68%)]">
          </div>          
        </div>
        <ReactQueryClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense>
              <ClusterProvider>
                <div className="flex min-h-screen w-full flex-col">
                  {children}
                </div>
              </ClusterProvider>
            </Suspense>
          </ThemeProvider>
        </ReactQueryClientProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
