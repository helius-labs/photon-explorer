"use client";

import { timeAgoWithFormat } from "@/utils/common";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import { ConfirmedSignatureInfo } from "@solana/web3.js";
import { CircleArrowDown } from "lucide-react";

import Signature from "@/components/common/signature";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TransactionCard({
  transaction,
}: {
  transaction: ConfirmedSignatureInfo | SignatureWithMetadata;
}) {
  return (
    <div className="grid grid-flow-col grid-cols-3 items-center gap-8 border-b pb-3">
      <div className="flex items-center gap-2">
        <CircleArrowDown strokeWidth={1} className="h-12 w-12" />
        <div className="grid gap-1">
          <div className="text-sm font-base leading-none">Received</div>
          <div className="text-sm text-muted-foreground">
            {transaction.blockTime
              ? timeAgoWithFormat(Number(transaction.blockTime), true)
              : ""}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src="https://raw.githubusercontent.com/igneous-labs/lst-offchain-metadata/master/hSOL/hSOL.png"
            alt="Helius Staked SOL"
          />
          <AvatarFallback>hSOL</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <div className="text-sm font-medium leading-none">+10 hSOL</div>
          <div className="text-sm text-muted-foreground">$1500.00</div>
        </div>
      </div>
      <div className="grid gap-1">
        <div className="text-sm text-muted-foreground">From</div>
        <div className="text-sm font-base leading-none">
          <Signature copy={false} signature={transaction.signature} />
        </div>
      </div>
    </div>
  );
}
