"use client";

import { timeAgoWithFormat } from "@/utils/common";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import { ConfirmedSignatureInfo } from "@solana/web3.js";
import { CircleArrowDown, Cog, CircleCheck } from "lucide-react";

import Signature from "@/components/common/signature";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TransactionCard({
  transaction,
}: {
  transaction: ConfirmedSignatureInfo | SignatureWithMetadata;
}) {
  return (
    <div className="grid md:grid-cols-3 gap-4 md:gap-8 border-b pb-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CircleArrowDown strokeWidth={1} className="h-8 w-8 md:h-12 md:w-12" />
          <div className="grid gap-1">
            <div className="text-sm font-base leading-none">Received</div>
            <div className="text-sm text-muted-foreground">
              {transaction.blockTime
                ? timeAgoWithFormat(Number(transaction.blockTime), true)
                : ""}
            </div>
          </div>
        </div>
        <div className="flex grid items-center text-right gap-2 md:hidden">
          <div className="text-sm text-muted-foreground">From</div>
          <div className="text-sm font-base leading-none">
            <Signature copy={false} signature={transaction.signature} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 md:justify-center">
        <div className="h-8 w-8 md:h-12 md:w-12 flex items-center justify-center">
          <CircleCheck strokeWidth={1} className="h-full w-full" />
        </div>
        <div className="grid gap-1">
          <div className="text-sm font-medium leading-none">+10 hSOL</div>
          <div className="text-sm text-muted-foreground">$1500.00</div>
        </div>
      </div>
      <div className="hidden md:flex md:grid gap-2 md:text-right md:justify-end">
        <div className="text-sm text-muted-foreground">From</div>
        <div className="text-sm font-base leading-none">
          <Signature copy={false} signature={transaction.signature} />
        </div>
      </div>
    </div>
  );
}
