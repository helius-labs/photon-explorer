import { CommandMenu } from "@/components/command-menu";
import { MainNav } from "@/components/main-nav";
import { NetworkStatusDropdown } from "@/components/network-dropdown";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <div className="relative border-b">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <MainNav className="flex-shrink-0" />
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-xs p-20 md:p-0 md:max-w-md">
          <CommandMenu />
        </div>
        <div className="flex flex-shrink-0 items-center space-x-2 md:space-x-4">
          <ThemeToggle />
          <NetworkStatusDropdown />
        </div>
      </div>
    </div>
  );
}
