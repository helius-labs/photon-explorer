import { MainNav } from "@/components/main-nav";
import { NetworkStatusDropdown } from "@/components/network-dropdown";
import { SearchBar } from "@/components/search-bar";
import ClusterSwitcher from "./cluster-switcher";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <div className="relative border-b w-full bg-background border-border">
      <div className="relative flex h-16 items-center justify-between px-4 md:px-8 w-full">
        {/* Left Section: Main Navigation */}
        <div className="flex-shrink-0 z-10">
          <MainNav />
        </div>

        {/* Center Section: Search Bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 z-0 w-full max-w-[600px] px-4">
          <SearchBar autoFocus={false} />
        </div>

        {/* Right Section: Buttons */}
        <div className="flex-shrink-0 flex items-center space-x-6 z-10">
          {/* Custom STAKE WITH US Button */}
          <div className="inline-flex items-center justify-center bg-[#E84125] text-[#050100] rounded-[2px] px-4 py-2 gap-2">
            <div className="w-[6px] h-[6px] bg-[#050100]"></div>
            <span className="text-[12px] font-['Geist Mono'] font-semibold leading-[20px]">STAKE WITH US</span>
            <div className="w-[6px] h-[6px] bg-[#050100]"></div>
          </div>

          {/* SWAP Button */}
          <Button variant="ghost" className="text-elements-midEm text-[12px] font-['Geist Mono'] px-4 py-2">
            SWAP
          </Button>

          {/* STATS Button */}
          <Button variant="ghost" className="text-elements-midEm text-[12px] font-['Geist Mono'] px-4 py-2">
            STATS
          </Button>

          {/* Cluster Switcher */}
          <div className="flex-shrink-0 flex items-center space-x-2 overflow-hidden">
            <ClusterSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
