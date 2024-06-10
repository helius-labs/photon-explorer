import type { Metadata } from "next";
import { Inter as Fontface } from "next/font/google";
import { Suspense } from "react";

import { cn } from "@/lib/utils";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ClusterProvider } from "@/components/providers/cluster-provider";
import { ReactQueryClientProvider } from "@/components/providers/query-client-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

import "./globals.css";

const fontface = Fontface({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Photon Block Explorer",
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
      <head />
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
              <ClusterProvider>
                <Header />
                <main className="container flex-1 space-y-4 p-8 pt-8">
                  {children}
                </main>
                <Footer />
              </ClusterProvider>
            </Suspense>
          </ThemeProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
