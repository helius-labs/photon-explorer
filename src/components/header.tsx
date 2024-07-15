import { CommandMenu } from "@/components/command-menu";
import { MainNav } from "@/components/main-nav";
import { NetworkStatusDropdown } from "@/components/network-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <div className="relative border-b">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <MainNav className="flex-shrink-0" />
        <div className="flex-grow flex justify-center md:justify-center md:w-auto">
          <div className="w-full max-w-[140px] md:max-w-none md:w-auto">
            <CommandMenu />
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center space-x-2 md:space-x-4">
          <ThemeToggle />
          <NetworkStatusDropdown />
        </div>
      </div>
    </div>
  );
}
