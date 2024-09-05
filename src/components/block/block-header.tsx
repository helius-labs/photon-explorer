import React from 'react';
import { timeAgoWithFormat } from "@/utils/common";
import { Badge } from "@/components/ui/badge";
import { useGetBlock } from "@/hooks/web3";

export default function BlockHeader({ slot }: { slot: number }) {
  const { data: block, isLoading, isError } = useGetBlock(Number(slot));

  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="grid gap-2">
        <div className="text-4xl font-bold leading-none">Block {slot}</div>
        <div className="flex flex-wrap items-center gap-2">
          {block && (
            <>
              <span>{block?.blockTime ? timeAgoWithFormat(block.blockTime) : "Unknown time"}</span>
              <Badge variant="success">Block</Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );
}