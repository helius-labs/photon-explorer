import { CommandMenu } from "@/components/command-menu";
import { MainNav } from "@/components/main-nav";
import { NetworkStatusDropdown } from "@/components/network-dropdown";

import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 md:px-8">
        <MainNav className="mr-auto" />
        <div className="flex items-center w-2/4 justify-center md:w-auto md:justify-start">
          <CommandMenu />
        </div>
        <div className="ml-auto flex items-center space-x-2 md:space-x-4">
          <ThemeToggle />
          <NetworkStatusDropdown />
        </div>
      </div>
    </div>
  );
}
