"use client";

import { useState } from "react";
import { useGetRecentPerformanceSamples } from '@/hooks/web3';
import { useCluster } from '@/providers/cluster-provider';
import { useGetPriorityFeeEstimate } from '@/hooks/useGetPriorityFeeEstimate';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/common/loading';
import { lamportsToSolString } from '@/lib/utils';
import { useInterval } from '@/hooks/useInterval';

const accountKeys = ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"];

export function NetworkStatusDropdown() {
  const { data: networkStatus, refetch: refetchNetworkStatus, isLoading: isNetworkLoading } = useGetRecentPerformanceSamples();
  const { data: priorityFeeLevels, refetch: refetchPriorityFeeLevels, isLoading: isFeeLoading } = useGetPriorityFeeEstimate(accountKeys);
  const {
    clusters,
    cluster,
    setCluster,
    customEndpoint,
    setCustomEndpoint,
    customCompressionEndpoint,
    setCustomCompressionEndpoint,
  } = useCluster();
  
  const [isHovered, setIsHovered] = useState(false);

  useInterval(() => {
    if (isHovered) {
      refetchNetworkStatus();
      refetchPriorityFeeLevels();
    }
  }, isHovered ? 2000 : null); // Update every 2 seconds while hovered

  const averageTps = networkStatus?.avgTps !== undefined ? Math.round(networkStatus.avgTps).toLocaleString('en-US') : 'N/A';
  const latency = networkStatus?.latency !== undefined ? networkStatus.latency : 'N/A';
  const priorityFeeInSol = priorityFeeLevels !== undefined
    ? lamportsToSolString(priorityFeeLevels.medium * 100, 5)
    : 'N/A';

  let networkConditionColor = 'bg-yellow-500';
  if (networkStatus?.avgTps !== undefined) {
    if (networkStatus.avgTps >= 800) {
      networkConditionColor = 'bg-green-500';
    } else if (networkStatus.avgTps < 1) {
      networkConditionColor = 'bg-red-500';
    }
  }

  return (
    <HoverCard openDelay={100} closeDelay={400}>
      <HoverCardTrigger asChild>
        <Button
          variant="outline"
          className="flex rounded-md items-center space-x-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="min-w-24 px-1 flex items-center justify-between">
            {clusters.find(({ value }) => value === cluster)?.label}
            <div className={`w-2 h-2 mr-2 rounded-full ${networkConditionColor} animate-pulse`}></div>
          </div>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        align="end"
        className="w-96 bg-background text-foreground rounded-lg shadow-lg mt-2 cursor-default"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Network Status</h2>
            <div className="flex items-center">
              <div className="text-sm mr-2">
                {clusters.find(({ value }) => value === cluster)?.label}
              </div>
            </div>
          </div>
          <Separator />
          {isNetworkLoading && cluster !== 'localnet' ? (
            <div className="mt-2"><Loading /></div>
          ) : (
            <div className="flex flex-col mb-4 mt-4">
              {cluster !== 'localnet' && (
                <div className="flex items-center space-x-4">
                  <div className="flex-1 flex flex-col">
                    <div className="text-xs font-medium">TPS</div>
                    <div className="flex items-center space-x-2 flash transition duration-300 ease-in-out transform-gpu hover:scale-105">
                      <div className={`w-3 h-3 rounded-full ${networkConditionColor}`}></div>
                      <div className="text-lg font-semibold">{averageTps}</div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="text-xs font-medium">Ping</div>
                    <div className="flex items-center space-x-2 animate-flash transition duration-300 ease-in-out transform-gpu hover:scale-105">
                      <div className={`w-3 h-3 rounded-full ${networkConditionColor}`}></div>
                      <div className="text-lg font-semibold">
                        {latency} <span className="text-xs">ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {cluster === 'mainnet-beta' && (
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex flex-col">
                    <div className="text-xs font-medium">Median Fee</div>
                    <div className="flex items-center space-x-2 transition duration-300 ease-in-out transform-gpu hover:scale-105">
                      <div className="text-lg font-semibold">
                        {isFeeLoading ? <div className="mt-2"><Loading /></div> : `${priorityFeeInSol} SOL`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="text-xs mb-4"></div>
          <div>
            <h2 className="text-md font-semibold mb-2">Choose a Network</h2>
            <div className="grid gap-4">
              {clusters
                .filter(({ value }) => value === 'mainnet-beta')
                .map(({ value, label, disabled }) => (
                  <div
                    key={value}
                    onClick={() => setCluster(value)}
                    className={`cursor-pointer rounded-md px-4 py-2 border rounded text-center ${cluster === value ? "ring-1" : ""} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {label}
                  </div>
                ))}
              <div className="flex space-x-2">
                {clusters
                  .filter(({ value }) => value === 'testnet' || value === 'devnet' || value === 'localnet')
                  .map(({ value, label, disabled }) => (
                    <div
                      key={value}
                      onClick={() => setCluster(value)}
                      className={`flex-1 cursor-pointer rounded-md px-4 py-2 border rounded text-center ${cluster === value ? "ring-1" : ""} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      {label}
                    </div>
                  ))}
              </div>
              <div
                onClick={() => setCluster('custom')}
                className={`cursor-pointer rounded-md px-4 py-2 border rounded text-center ${cluster === 'custom' ? "ring-1" : ""}`}
              >
                Custom
              </div>
              {cluster === "custom" && (
                <>
                  <div className="grid w-full max-w-sm items-center gap-2">
                    <Label htmlFor="customEndpoint">Custom RPC URL</Label>
                    <Input
                      id="customEndpoint"
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
      </HoverCardContent>
    </HoverCard>
  );
}
