"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useCluster } from "@/components/cluster-provider";

export default function ClusterSwitcher() {
  const {
    clusters,
    cluster,
    setCluster,
    clusterCustomRpcUrl,
    setClusterCustomRpcUrl,
  } = useCluster();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="min-w-32">
          {clusters.find(({ value }) => value === cluster)?.label}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Choose a Cluster</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {clusters.map(({ value, label }) => (
            <Button
              variant="outline"
              key={value}
              onClick={() => setCluster(value)}
              className={cluster === value ? "ring-1" : ""}
            >
              {label}
            </Button>
          ))}
          <Input
            type="url"
            placeholder="Custom RPC URL"
            value={clusterCustomRpcUrl}
            onChange={(e) => setClusterCustomRpcUrl(e.target.value)}
            className={cluster !== "custom" ? "hidden" : ""}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
