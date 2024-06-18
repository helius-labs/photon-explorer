"use client";

import { useGetRecentPerformanceSamples } from '@/hooks/web3';
import { useCluster } from '@/providers/cluster-provider';
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

export function NetworkStatusDropdown() {
  const { data: networkStatus, isLoading } = useGetRecentPerformanceSamples();
  const {
    clusters,
    cluster,
    setCluster,
    customEndpoint,
    setCustomEndpoint,
    customCompressionEndpoint,
    setCustomCompressionEndpoint,
  } = useCluster();

  const averageTps = networkStatus?.avgTps !== undefined ? Math.round(networkStatus.avgTps).toLocaleString('en-US') : 'N/A';
  const latency = networkStatus?.latency !== undefined ? networkStatus.latency : 'N/A';

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
        <Button variant="outline" className="flex items-center space-x-2">
          <div className="min-w-24 px-1 rounded flex items-center justify-between">
            {clusters.find(({ value }) => value === cluster)?.label}
            <div className={`w-2 h-2 mr-2 rounded-full ${networkConditionColor}`}></div>
          </div>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 bg-background text-foreground rounded-lg shadow-lg mt-2">
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
          {isLoading ? (
            <div><Loading /></div>
          ) : (
            <div className="flex flex-col mb-4 mt-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <div className="text-xs font-medium">TPS</div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${networkConditionColor}`}></div>
                      <div className="text-lg font-semibold">{averageTps}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <div className="text-xs font-medium">Ping</div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${networkConditionColor}`}></div>
                      <div className="text-lg font-semibold">
                        {latency} <span className="text-xs">ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                    className={`cursor-pointer px-4 py-2 border rounded text-center ${cluster === value ? "ring-1" : ""} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
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
                      className={`flex-1 cursor-pointer px-4 py-2 border rounded text-center ${cluster === value ? "ring-1" : ""} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      {label}
                    </div>
                  ))}
              </div>
              <div
                onClick={() => setCluster('custom')}
                className={`cursor-pointer px-4 py-2 border rounded text-center ${cluster === 'custom' ? "ring-1" : ""}`}
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
