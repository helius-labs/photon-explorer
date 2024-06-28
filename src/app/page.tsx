import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import LatestNonVotingSignatures from "@/components/latest-nonvoting-signatures";
import { MainNav } from "@/components/main-nav";
import { NetworkStatusDropdown } from "@/components/network-dropdown";
import { Search } from "@/components/search";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Home | XRAY",
  description:
    "The most readable Solana explorer. Explore the Solana blockchain with ease.",
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

          <div className="w-full max-w-md md:max-w-lg lg:max-w-xl pb-8 md:pb-16">
            <LatestNonVotingSignatures />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
