import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import ClusterSwitcher from "@/components/cluster-switcher";
import { CommandMenu } from "@/components/command-menu";
import { MainNav } from "@/components/main-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { SecondaryNav } from "@/components/secondary-nav";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
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
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div>
            <div className="border-b">
              <div className="container flex h-16 items-center px-8">
                <MainNav className="mr-6" />
                <div className="ml-auto flex items-center space-x-4">
                  <CommandMenu />
                </div>
                <div className="ml-auto flex items-center space-x-4">
                  <SecondaryNav className="mx-6" />
                  <ModeToggle />
                  <ClusterSwitcher />
                </div>
              </div>
            </div>

            <div className="container flex-1 space-y-4 p-8 pt-6">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
