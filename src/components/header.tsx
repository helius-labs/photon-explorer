import ClusterSwitcher from "@/components/cluster-switcher";
import { CommandMenu } from "@/components/command-menu";
import { MainNav } from "@/components/main-nav";
// import { ModeToggle } from "@/components/mode-toggle";
import { SecondaryNav } from "@/components/secondary-nav";
import { ThemeToggle } from "./theme-toggle";
import { NetworkStatusDropdown } from "@/components/network-status";

export function Header() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-8">
        <MainNav className="mr-6" />
        <div className="ml-auto flex items-center space-x-4">
          <CommandMenu />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <NetworkStatusDropdown />
          <SecondaryNav className="mx-6" />
          <ThemeToggle />
          <ClusterSwitcher />
        </div>
      </div>
    </div>
  );
}
