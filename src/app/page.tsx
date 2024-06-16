import type { Metadata } from "next";
import ClusterSwitcher from "@/components/cluster-switcher";
import { Footer } from "@/components/footer";
import LatestNonVotingSignatures from "@/components/latest-nonvoting-signatures";
import { Search } from "@/components/search";
import { ThemeToggle } from "@/components/theme-toggle";
import { NetworkStatusDropdown } from "@/components/network-status";
import { MainNav } from "@/components/main-nav";

export const metadata: Metadata = {
  title: "Home | XRAY Beta - Solana Explorer",
  description: "The simplest, clearest and most readable explorer for everyday people.",
};

export default function Home() {
  return (
    <>
      <div>
        <div className="flex h-16 items-center px-4 md:px-8">
          <MainNav />
          <div className="ml-auto flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            <NetworkStatusDropdown />
          </div>
        </div>
      </div>
      <div className="grid pt-20 md:pt-40">
        <div className="flex flex-col items-center space-y-6 md:space-y-10">
          <h1 className="text-5xl md:text-9xl font-bold">XRAY</h1>

          <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
            <Search />
          </div>

          <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl pb-8 md:pb-16">
            <LatestNonVotingSignatures />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
