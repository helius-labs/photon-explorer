"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { displayTimestamp, displayTimestampUtc } from '@/utils/dateFormatter';
import { useGetEpochInfo, useGetBlock } from '@/hooks/web3';
import { shorten } from '@/utils/common';
import { CheckIcon, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  slot: number;
};

export const BlockOverview: React.FC<Props> = ({ slot }) => {
  const { data: epochInfo } = useGetEpochInfo();
  const { data: blockInfo, isLoading, isError } = useGetBlock(slot);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !blockInfo) return <div>Error loading block data</div>;

  const { blockLeader, childSlot, childLeader, parentLeader } = blockInfo;
  const successfulTransactions = blockInfo.transactions.filter(tx => !tx.meta?.err).length;
  const successPercentage = ((successfulTransactions / blockInfo.transactions.length) * 100).toFixed(2);
  const totalRewards = blockInfo.rewards?.reduce((sum, reward) => sum + reward.lamports, 0) || 0;

  return (
    <TooltipProvider>
      <Card className="bg-black/20 border-0">
        <CardHeader>
          <CardTitle className="text-white">Block Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Slot" value={slot.toString()} />
            <InfoItem label="Blockhash" value={blockInfo.blockhash} displayValue={shorten(blockInfo.blockhash)} />
            <InfoItem label="Parent Slot" value={blockInfo.parentSlot.toString()} />
            <InfoItem label="Parent Blockhash" value={blockInfo.previousBlockhash} displayValue={shorten(blockInfo.previousBlockhash)} />
            {blockInfo.blockTime && (
              <>
                <InfoItem label="Timestamp (Local)" value={displayTimestamp(blockInfo.blockTime * 1000)} />
                <InfoItem label="Timestamp (UTC)" value={displayTimestampUtc(blockInfo.blockTime * 1000)} />
              </>
            )}
            <InfoItem label="Transactions" value={blockInfo.transactions.length.toString()} />
            <InfoItem label="Successful Transactions" value={`${successfulTransactions} (${successPercentage}%)`} />
            <InfoItem label="Total Rewards" value={`${totalRewards / 1e9} SOL`} />
            {epochInfo && <InfoItem label="Epoch" value={epochInfo.epoch.toString()} />}
            <InfoItem label="Block Leader" value={blockLeader ? blockLeader.toBase58() : 'Unknown'} displayValue={blockLeader ? shorten(blockLeader.toBase58()) : 'Unknown'} />
            <InfoItem label="Parent Leader" value={parentLeader ? parentLeader.toBase58() : 'Unknown'} displayValue={parentLeader ? shorten(parentLeader.toBase58()) : 'Unknown'} />
            {childSlot !== undefined && (
              <>
                <InfoItem label="Child Slot" value={childSlot.toString()} />
                <InfoItem label="Child Leader" value={childLeader ? childLeader.toBase58() : 'Unknown'} displayValue={childLeader ? shorten(childLeader.toBase58()) : 'Unknown'} />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

const InfoItem = ({ label, value, displayValue }: { label: string; value: string; displayValue?: string }) => {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setHasCopied(true);
  };

  return (
    <div className="flex flex-row items-center">
      <div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className="font-medium text-white truncate">
          {displayValue || value}
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="ml-2 h-5 w-5 rounded-[6px] [&_svg]:size-3.5 flex items-center"
            onClick={handleCopy}
          >
            <span className="sr-only">Copy</span>
            {hasCopied ? <CheckIcon /> : <Copy />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy {label}</TooltipContent>
      </Tooltip>
    </div>
  );
}

export default BlockOverview;