"use client";

import { useCluster } from "@/providers/cluster-provider";
import { CLUSTERS, Cluster, clusterName, clusterSlug } from "@/utils/cluster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import solLogoSwitch from "@/../public/assets/solLogoSwitch.svg"; // Import the SVG
import { AlignRightIcon } from "lucide-react"; // Import ChevronRight from lucide-react

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function ClusterSwitcher() {
  const {
    cluster,
    setCluster,
    customEndpoint,
    setCustomEndpoint,
    customCompressionEndpoint,
    setCustomCompressionEndpoint,
  } = useCluster();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="h-[30px] p-0 shadow-none flex items-center">
          <div className="flex items-center justify-start p-0.5 shadow-inner">
            <div className="w-5 h-5 flex justify-center items-center">
              <Image
                src={solLogoSwitch}
                alt="Solana Logo"
                width={20}
                height={20}
              />
            </div>
            <div className="px-2 py-1 flex items-center gap-1">
              <div className="text-[#b88076] text-[13px] font-['Geist Mono'] leading-[18px]">
                {clusterName(cluster)}
              </div>
            </div>
            <AlignRightIcon className="w-4 h-4 text-muted ml-2" />
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Choose a Cluster</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {CLUSTERS.map((clusterItem, index) => (
            <Button
              variant="outline"
              key={clusterSlug(clusterItem)}
              onClick={() => setCluster(clusterItem)}
              className={cluster === clusterItem ? "ring-1" : ""}
            >
              {clusterName(clusterItem)}
            </Button>
          ))}
          <div
            className={
              cluster !== Cluster.Custom
                ? "hidden"
                : "grid w-full max-w-sm items-center gap-2"
            }
          >
            <Label htmlFor="customEndpoint">Custom RPC URL</Label>
            <Input
              id="customEndpoint"
              type="url"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
            />{" "}
          </div>
          <div
            className={
              cluster !== Cluster.Custom
                ? "hidden"
                : "grid w-full max-w-sm items-center gap-2"
            }
          >
            <Label htmlFor="customCompressionEndpoint">
              Custom Compression RPC URL
            </Label>
            <Input
              id="customCompressionEndpoint"
              type="url"
              value={customCompressionEndpoint}
              onChange={(e) => setCustomCompressionEndpoint(e.target.value)}
            />
          </div>
        </div>
        <div
          className={
            cluster !== Cluster.Localnet && cluster !== "custom"
              ? "hidden"
              : "mt-8"
          }
        >
          <div className="mb-[32px] flex flex-col p-0">
            <div className="mb-[12px] flex gap-2"></div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
