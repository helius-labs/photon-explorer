import type { Metadata } from "next";
import Image from "next/image";
import xrayLogo from "@/../public/assets/xrayLogo.svg";

import { Footer } from "@/components/footer";
import LatestNonVotingSignatures from "@/components/latest-nonvoting-signatures";
import { MainNav } from "@/components/main-nav";
import { NetworkStatusDropdown } from "@/components/network-dropdown";
import { SearchBar } from "@/components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Home | XRAY",
  description: "The most readable Solana explorer. Explore the Solana blockchain with ease.",
};

export default async function Home() {
  return (
    <>
      <div>
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <MainNav />
          <div className="ml-auto flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            <NetworkStatusDropdown />
          </div>
        </div>
      </div>
      <div className="grow px-4 pt-20 md:pt-40">
        <div className="flex flex-col items-center space-y-6 md:space-y-10">
          <div className="w-48 h-14 sm:w-48 sm:h-14 md:w-72 md:h-16 lg:w-96 lg:h-24">
            <Image src={xrayLogo} alt="XRAY Logo" layout="responsive" />
          </div>
          <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
            <SearchBar autoFocus={false} />
          </div>
          <div className="w-full max-w-md pb-8 md:max-w-lg md:pb-16 lg:max-w-xl">
            <LatestNonVotingSignatures />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
