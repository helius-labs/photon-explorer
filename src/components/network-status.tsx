"use client";

import React from 'react';
import { useGetRecentPerformanceSamples } from '@/hooks/web3';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CogIcon } from 'lucide-react';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Separator } from '@/components/ui/separator';

export function NetworkStatusDropdown() {
  const { data: networkStatus, isLoading } = useGetRecentPerformanceSamples();

  const averageTps = networkStatus?.avgTps !== undefined ? Math.round(networkStatus.avgTps).toLocaleString('en-US') : 'N/A';
  const latency = networkStatus?.latency !== undefined ? networkStatus.latency : 'N/A';
  const avgSlotTime1Min = networkStatus?.avgSlotTime_1min !== undefined ? networkStatus.avgSlotTime_1min : 'N/A';

  let networkConditionColor = 'bg-red-500';
  if (networkStatus?.avgTps !== undefined) {
    if (networkStatus.avgTps >= 800) {
      networkConditionColor = 'bg-green-500';
    } else if (networkStatus.avgTps >= 300) {
      networkConditionColor = 'bg-yellow-500';
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2">
        <CogIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 bg-background text-foreground rounded-lg shadow-lg mt-2">
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Network Status</h2>
            <div className="flex items-center">
              <div className="text-xs mr-2">Network Condition</div>
              <div className={`w-3 h-3 rounded-full ${networkConditionColor}`}></div>
            </div>
          </div>
          <Separator />
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="flex flex-col mb-4 mt-4">
              <div className="flex justify-between mb-2">
                <div>
                  <div className="text-xs">
                    <span className="flex">
                      Average TPS <QuestionMarkCircledIcon className="ml-1" />
                    </span>
                  </div>
                  <div className="text-lg font-semibold">{averageTps}</div>
                </div>
                <div>
                  <div className="text-xs">
                    <span className="flex">
                      Average Latency <QuestionMarkCircledIcon className="ml-1" />
                    </span>
                  </div>
                  <div className="text-lg font-semibold">
                    {latency} <span className="text-xs">ms</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <div className="text-xs">
                    <span className="flex">
                      Average Slot Time <QuestionMarkCircledIcon className="ml-1" />
                    </span>
                  </div>
                  <div className="text-lg font-semibold">
                    {avgSlotTime1Min} <span className="text-xs">ms</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs">
                    <span className="flex ">
                      Average Tx Fee <QuestionMarkCircledIcon className="ml-1" />
                    </span>
                  </div>
                  <div className="text-lg font-semibold">
                    0.00001 <span className="text-xs">SOL</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="text-xs text-yellow-500">
            <p>⚠️ Network Status:</p>
            <p>The Solana network is currently experiencing a high volume of transactions, leading to increased network congestion. As a result, transactions can take longer to confirm and may occasionally time out.</p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
