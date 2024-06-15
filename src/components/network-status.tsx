'use client'

import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CogIcon } from 'lucide-react';

export function NetworkStatusDropdown() {
    //const { avgTps, status } = ();
    //const averageTps = Math.round(avgTps).toLocaleString('en-US');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-2">
                <CogIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96 bg-background text-foreground rounded-lg shadow-lg mt-2">
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2">Network Status</h2>
                    <div className="flex justify-between mb-4">
                        <div>
                            <div className="text-xs">Average TPS</div>
                            <div className="text-lg font-semibold">
                                {0}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs">Ping</div>
                            <div className="text-lg font-semibold">
                                {0}
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
