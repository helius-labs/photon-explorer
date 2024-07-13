"use client";

import { timeAgoWithFormat } from "@/utils/common";
import Avatar from "boring-avatars";

import { useGetBlock } from "@/hooks/web3";

import { Badge } from "@/components/ui/badge";

export default function BlockHeader({ slot }: { slot: number }) {
  const { data, isLoading, isError } = useGetBlock(Number(slot));

  return (
    <div className="mb-8 flex items-center gap-4">
      <Avatar
        size={80}
        name={slot.toString()}
        variant="marble"
        colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
      />

      <div className="grid gap-2">
        <div className="text-3xl font-medium leading-none">{slot}</div>
        <div className="flex flex-wrap items-center gap-2">
          {data && timeAgoWithFormat(Number(data?.blockTime), true)}
          <Badge variant="success">Block</Badge>
        </div>
      </div>
    </div>
  );
}
