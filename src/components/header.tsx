import ClusterSwitcher from "@/components/cluster-switcher";
import { CommandMenu } from "@/components/command-menu";
import { MainNav } from "@/components/main-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { SecondaryNav } from "@/components/secondary-nav";

export function Header() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-8">
        <MainNav className="mr-6" />
        <div className="ml-auto flex items-center space-x-4">
          <CommandMenu />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <SecondaryNav className="mx-6" />
          <ModeToggle />
          <ClusterSwitcher />
        </div>
      </div>
    </div>
  );
}
