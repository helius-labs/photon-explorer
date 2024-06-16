"use client";

import React from 'react';
import { useGetRecentPerformanceSamples } from '@/hooks/web3';
import { useCluster } from '@/providers/cluster-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  let networkConditionColor = 'bg-red-500';
  if (networkStatus?.avgTps !== undefined) {
    if (networkStatus.avgTps >= 800) {
      networkConditionColor = 'bg-green-500';
    } else if (networkStatus.avgTps >= 300) {
      networkConditionColor = 'bg-yellow-500';
    } else {
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2">
        <Button variant="outline" className="min-w-32">
          Network
          <div className={`w-2 h-2 ml-4 rounded-full ${networkConditionColor}`}></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 bg-background text-foreground rounded-lg shadow-lg mt-2">
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Network Info</h2>
            <div className="flex items-center">
              <div className="text-sm mr-2">
                {clusters.find(({ value }) => value === cluster)?.label}
              </div>
            </div>
          </div>
          <Separator />
          {isLoading ? (
            <div>Loading...</div>
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
          <div className="text-xs mb-4">
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Choose a Cluster</h2>
            <div className="grid gap-4">
              {clusters
                .filter(({ value }) => value === 'mainnet-beta')
                .map(({ value, label, disabled }) => (
                  <Button
                    variant="outline"
                    key={value}
                    onClick={() => setCluster(value)}
                    className={cluster === value ? "ring-1" : ""}
                    disabled={disabled}
                  >
                    {label}
                  </Button>
                ))}
              <div className="flex space-x-2">
                {clusters
                  .filter(({ value }) => value === 'testnet' || value === 'devnet' || value === 'localnet')
                  .map(({ value, label, disabled }) => (
                    <Button
                      variant="outline"
                      key={value}
                      onClick={() => setCluster(value)}
                      className={`flex-1 ${cluster === value ? "ring-1" : ""}`}
                      disabled={disabled}
                    >
                      {label}
                    </Button>
                  ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setCluster('custom')}
                className={cluster === 'custom' ? "ring-1" : ""}
              >
                Custom
              </Button>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
