import { MainNav } from "@/components/main-nav";
import { NetworkStatusDropdown } from "@/components/network-dropdown";
import { SearchBar } from "@/components/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";


export function Header() {
  return (
    <div className="relative border-b w-full">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 w-full">
        <div className="flex-shrink-0">
          <MainNav />
        </div>
        <div className="flex-grow flex justify-center ml-4 md:ml-14">
        <div className="w-full max-w-[240px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[500px] xl:max-w-[600px]">
          <SearchBar autoFocus={false} />
          </div>
        </div>
          <div className="flex-shrink-0 flex items-center space-x-2 overflow-hidden">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <NetworkStatusDropdown />
        </div>
      </div>
    </div>
  );
}
