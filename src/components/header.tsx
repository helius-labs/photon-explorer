import { MainNav } from "@/components/main-nav";
import { NetworkStatusDropdown } from "@/components/network-dropdown";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";

import ClusterSwitcher from "./cluster-switcher";

export function Header() {
  return (
    <div className="relative w-full border-b border-border bg-background">
      <div className="relative flex h-16 w-full items-center justify-between px-4 md:px-8">
        {/* Left Section: Main Navigation */}
        <div className="z-10 flex-shrink-0">
          <MainNav />
        </div>

        {/* Center Section: Search Bar */}
        <div className="absolute left-1/2 z-0 w-full max-w-[600px] -translate-x-1/2 transform px-4">
          <SearchBar autoFocus={false} />
        </div>

        {/* Right Section: Buttons */}
        <div className="z-10 flex flex-shrink-0 items-center space-x-6">
          {/* Custom STAKE WITH US Button */}
          <div className="inline-flex items-center justify-center gap-2 rounded-[2px] bg-[#E84125] px-4 py-2 text-[#050100]">
            <div className="h-[6px] w-[6px] bg-[#050100]"></div>
            <span className="font-['Geist Mono'] text-[12px] font-semibold leading-[20px]">
              STAKE
            </span>
            <div className="h-[6px] w-[6px] bg-[#050100]"></div>
          </div>

          {/* SWAP Button */}
          <Button
            variant="ghost"
            className="text-elements-midEm font-['Geist Mono'] px-4 py-2 text-[12px]"
          >
            SWAP
          </Button>

          {/* STATS Button */}
          <Button
            variant="ghost"
            className="text-elements-midEm font-['Geist Mono'] px-4 py-2 text-[12px]"
          >
            STATS
          </Button>

          {/* Cluster Switcher */}
          <div className="flex flex-shrink-0 items-center space-x-2 overflow-hidden">
            <ClusterSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
