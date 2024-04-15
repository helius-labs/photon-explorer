"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

enum Cluster {
  MainnetBeta = "Mainnet Beta",
  Testnet = "Testnet",
  Devnet = "Devnet",
  Localnet = "Localnet",
}

export default function ClusterSwitcher() {
  const [cluster, setCluster] = React.useState<string>(Cluster.MainnetBeta);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-32">
          {cluster}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Choose a Cluster</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={cluster} onValueChange={setCluster}>
          <DropdownMenuRadioItem value={Cluster.MainnetBeta}>
            Mainnet Beta
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={Cluster.Testnet}>
            Testnet
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={Cluster.Devnet}>
            Devnet
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={Cluster.Localnet}>
            Localnet
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
