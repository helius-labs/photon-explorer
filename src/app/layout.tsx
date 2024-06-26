import { ClusterProvider } from "@/providers/cluster-provider";
import { ReactQueryClientProvider } from "@/providers/query-client-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import { Inter as Fontface } from "next/font/google";
import { Suspense } from "react";

import { cn } from "@/lib/utils";

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
      url: "/favicon/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "512x512",
      url: "/favicon/favicon-512x512.png",
    },
    {
      rel: "apple-touch-icon",
      url: "/favicon/favicon-512x512.png",
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        </head>
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          fontface.className,
        )}
      >
        <ReactQueryClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense>
              <ClusterProvider>{children}</ClusterProvider>
            </Suspense>
          </ThemeProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
