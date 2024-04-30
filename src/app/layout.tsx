import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Manrope as Fontface } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ClusterProvider } from "@/components/cluster-provider";
import { ReactQueryClientProvider } from "@/components/query-client-provider";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Suspense } from "react";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryClientProvider>
            <Suspense>
              <ClusterProvider>
                <Header />
                <main className="container flex-1 space-y-4 p-8 pt-6">
                  {children}
                </main>
                <Footer />
              </ClusterProvider>
            </Suspense>
          </ReactQueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
