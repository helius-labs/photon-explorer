import { CommandMenu } from "@/components/command-menu";
import { MainNav } from "@/components/main-nav";
import { NetworkStatusDropdown } from "@/components/network-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <div className="relative border-b">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <MainNav className="flex-shrink-0 lg:w-56" />
        <div className="flex flex-grow justify-center md:w-auto md:justify-center">
          <div className="w-full sm:max-w-sm md:max-w-md lg:max-w-lg">
            <CommandMenu />
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center justify-end space-x-2 md:space-x-4 lg:w-56">
          <ThemeToggle />
          <NetworkStatusDropdown />
        </div>
      </div>
    </div>
  );
}
