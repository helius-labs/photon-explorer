"use client";

import { useCluster } from "@/providers/cluster-provider";
import { CLUSTERS, Cluster, clusterName, clusterSlug } from "@/utils/cluster";
import { lamportsToSolString } from "@/utils/common";
import { useEffect, useState } from "react";

import { useGetPriorityFeeEstimate } from "@/hooks/useGetPriorityFeeEstimate";
import { useGetRecentPerformanceSamples } from "@/hooks/web3";

import Loading from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const accountKeys = ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"];

export function NetworkStatusDropdown() {
  const {
    cluster,
    setCluster,
    customEndpoint,
    setCustomEndpoint,
    customCompressionEndpoint,
    setCustomCompressionEndpoint,
  } = useCluster();

  const { data: networkStatus, isLoading: isNetworkLoading } =
    useGetRecentPerformanceSamples({
      enabled: cluster !== Cluster.Localnet,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: 60000, // 60 seconds
      refetchIntervalInBackground: true,
    });

  const { data: priorityFeeLevels, isLoading: isFeeLoading } =
    useGetPriorityFeeEstimate(accountKeys, {
      enabled: cluster === Cluster.MainnetBeta,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: 60000, // 60 seconds
      refetchIntervalInBackground: true,
    });

  const averageTps =
    networkStatus?.avgTps !== undefined
      ? Math.round(networkStatus.avgTps).toLocaleString("en-US")
      : "N/A";
  const latency =
    networkStatus?.latency !== undefined ? networkStatus.latency : "N/A";
  const priorityFeeInSol =
    priorityFeeLevels?.medium !== undefined
      ? lamportsToSolString(priorityFeeLevels.medium * 100, 5)
      : "N/A";

  let tpsColor = "bg-white";
  let pingColor = "bg-white";

  if (networkStatus?.avgTps !== undefined) {
    if (cluster === Cluster.MainnetBeta) {
      if (networkStatus.avgTps >= 1000) {
        tpsColor = "bg-green-500";
      } else if (networkStatus.avgTps >= 100 && networkStatus.avgTps < 1000) {
        tpsColor = "bg-yellow-500";
      } else if (networkStatus.avgTps < 100) {
        tpsColor = "bg-red-500";
      }
    } else {
      if (networkStatus.avgTps === 0) {
        tpsColor = "bg-yellow-500";
      } else if (networkStatus.avgTps > 0) {
        tpsColor = "bg-green-500";
      }
    }
  }

  if (latency !== "N/A") {
    if (latency < 500) {
      pingColor = "bg-green-500";
    } else if (latency >= 500 && latency <= 1000) {
      pingColor = "bg-yellow-500";
    } else if (latency > 1000) {
      pingColor = "bg-red-500";
    }
  }

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkIfTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0,
      );
    };

    checkIfTouchDevice();
    window.addEventListener("resize", checkIfTouchDevice);

    return () => {
      window.removeEventListener("resize", checkIfTouchDevice);
    };
  }, []);

  const renderContent = () => (
    <div className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Network Status</h2>
        <div className="flex items-center">
          <div className="mr-2 text-sm">{clusterName(cluster)}</div>
        </div>
      </div>
      <Separator />
      {isNetworkLoading && cluster !== Cluster.Localnet ? (
        <div className="mt-4">
          <Loading />
        </div>
      ) : (
        <div className="mb-4 mt-4 flex flex-col">
          {cluster !== Cluster.Localnet && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-start">
                <div className="text-xs font-medium">TPS</div>
                <div className="flex transform-gpu items-center space-x-2 transition duration-300 ease-in-out hover:scale-105">
                  <div className={`h-3 w-3 rounded-full ${tpsColor}`}></div>
                  <div className="text-lg font-semibold">{averageTps}</div>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-xs font-medium">Ping</div>
                <div className="flex transform-gpu items-center space-x-2 transition duration-300 ease-in-out hover:scale-105">
                  <div className={`h-3 w-3 rounded-full ${pingColor}`}></div>
                  <div className="text-lg font-semibold">
                    {latency} <span className="text-xs">ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {cluster === Cluster.MainnetBeta && (
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex flex-col">
                <div className="text-xs font-medium">Median Fee</div>
                <div className="flex transform-gpu items-center space-x-2 transition duration-300 ease-in-out hover:scale-105">
                  <div className="text-lg font-semibold">
                    {isFeeLoading ? (
                      <div className="mt-2">
                        <Loading />
                      </div>
                    ) : (
                      `${priorityFeeInSol} SOL`
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="mb-4 text-xs"></div>
      <div>
        <h2 className="text-md mb-2 font-semibold">Choose a Network</h2>
        <div className="grid gap-2">
          {CLUSTERS.filter(
            (clusterItem) => clusterItem === Cluster.MainnetBeta,
          ).map((clusterItem) => (
            <div
              key={clusterSlug(clusterItem)}
              onClick={() => setCluster(clusterItem)}
              className={`cursor-pointer rounded-md border px-4 py-2 text-center ${
                cluster === clusterItem ? "ring-1" : ""
              }`}
            >
              {clusterName(clusterItem)}
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2">
            {CLUSTERS.filter(
              (clusterItem) =>
                clusterItem === Cluster.Testnet ||
                clusterItem === Cluster.Devnet ||
                clusterItem === Cluster.Localnet,
            ).map((clusterItem) => (
              <div
                key={clusterSlug(clusterItem)}
                onClick={() => setCluster(clusterItem)}
                className={`cursor-pointer rounded-md border px-4 py-2 text-center text-xs md:text-base ${
                  cluster === clusterItem ? "ring-1" : ""
                }`}
              >
                {clusterName(clusterItem)}
              </div>
            ))}
          </div>
          <div
            onClick={() => setCluster(Cluster.Custom)}
            className={`cursor-pointer rounded-md border px-4 py-2 text-center text-xs md:text-base ${
              cluster === Cluster.Custom ? "ring-1" : ""
            }`}
          >
            Custom
          </div>
          {cluster === Cluster.Custom && (
            <>
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="customEndpoint">Custom RPC URL</Label>
                <Input
                  id="customEndpoint"
                  className="pl-2"
                  type="url"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="customCompressionEndpoint">
                  Custom Compression RPC URL
                </Label>
                <Input
                  id="customCompressionEndpoint"
                  className="pl-2"
                  type="url"
                  value={customCompressionEndpoint}
                  onChange={(e) => setCustomCompressionEndpoint(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return isTouchDevice ? (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex h-10 w-10 items-center justify-center rounded-full md:h-auto md:w-auto md:rounded-md"
        >
          <div className="flex items-center justify-center">
            <div className="hidden md:block">{clusterName(cluster)}</div>
            <div
              className={`h-2 w-2 rounded-full md:ml-2 ${tpsColor} animate-pulse`}
            ></div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="mt-2 w-full max-w-xs cursor-default rounded-lg bg-background text-foreground shadow-lg md:max-w-md"
      >
        {renderContent()}
      </PopoverContent>
    </Popover>
  ) : (
    <HoverCard openDelay={100} closeDelay={400}>
      <HoverCardTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-between rounded-md"
        >
          <div className="flex items-center justify-center">
            <div className="hidden md:block">{clusterName(cluster)}</div>
            <div
              className={`h-2 w-2 rounded-full md:ml-2 ${tpsColor} animate-pulse`}
            ></div>
          </div>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        align="end"
        className="mt-2 w-full max-w-xs cursor-default rounded-lg bg-background text-foreground shadow-lg md:max-w-md"
      >
        {renderContent()}
      </HoverCardContent>
    </HoverCard>
  );
}
