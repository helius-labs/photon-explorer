import { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { SecondaryNav } from "@/components/secondary-nav";
import { CommandMenu } from "@/components/command-menu";
import ClusterSwitcher from "@/components/cluster-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import RecentTransactions from "@/components/recent-transactions";

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          The Photon Block Explorer
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentTransactions />
      </div>
    </>
  );
}
