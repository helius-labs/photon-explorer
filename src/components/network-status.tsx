"use client";

import React from 'react';
import { useGetRecentPerformanceSamples } from '@/hooks/web3';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CogIcon } from 'lucide-react';

export function NetworkStatusDropdown() {
  const { data: networkStatus, isLoading: isLoadingStatus } = useGetRecentPerformanceSamples();

  const averageTps = networkStatus?.avgTps !== undefined ? Math.round(networkStatus.avgTps).toLocaleString('en-US') : 'N/A';
  const roundTripTime = networkStatus?.roundTripTime !== undefined ? `${networkStatus.roundTripTime} ms` : 'N/A';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center">
        <CogIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 bg-background text-foreground rounded-lg shadow-lg mt-2 overflow-hidden">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Network Status</h2>
          <div className="flex justify-between mb-4">
            <div>
              <div className="text-xs">Average TPS</div>
              <div className="text-lg font-semibold">
                {isLoadingStatus ? 'Loading...' : averageTps}
              </div>
            </div>
            <div>
              <div className="text-xs">Ping</div>
              <div className="text-lg font-semibold">
                {isLoadingStatus ? 'Loading...' : roundTripTime}
              </div>
            </div>
          </div>
          <div className="text-xs mb-4 text-yellow-500">
            <p>⚠️ Network Status:</p>
            <p>The Solana network is currently experiencing a high volume of transactions, leading to increased network congestion. As a result, transactions can take longer to confirm and may occasionally time out.</p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
