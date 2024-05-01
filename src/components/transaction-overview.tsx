"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Address from "@/components/address";
import TransactionHash from "@/components/transaction-hash";
import { CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { timeAgoWithFormat } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionOverview({
  transaction,
}: {
  transaction: any;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1">
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger>
                  <CircleHelp className="mr-2 h-3.5 w-3.5" />
                </PopoverTrigger>
                <PopoverContent className="max-w-80">
                  <p>
                    The first signature in a transaction, which can be used to
                    uniquely identify the transaction across the complete
                    ledger.
                  </p>
                </PopoverContent>
              </Popover>
              <span className="mr-1 text-muted-foreground">
                Transaction Hash
              </span>
            </div>
          </div>
          <div className="col-span-3">
            {transaction?.transaction.signatures[0] && (
              <TransactionHash short={false}>
                {transaction?.transaction.signatures[0]}
              </TransactionHash>
            )}
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Status</span>
          </div>
          <div className="col-span-3">
            <Badge className="text-xs" variant="outline">
              {transaction?.meta?.err === null ? "Success" : "Failed"}
            </Badge>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Slot</span>
          </div>
          <div className="col-span-3">
            <span>#{transaction?.slot}</span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Timestamp</span>
          </div>
          <div className="col-span-3">
            <span>
              {transaction?.blockTime &&
                timeAgoWithFormat(transaction?.blockTime)}
            </span>
          </div>

          <Separator className="col-span-4 my-4" />

          <div className="col-span-1">
            <span className="text-muted-foreground">Signer</span>
          </div>
          <div className="col-span-3">
            {transaction?.transaction.message.accountKeys[0].pubkey && (
              <Address short={false}>
                {transaction?.transaction.message.accountKeys[0].pubkey}
              </Address>
            )}
          </div>

          <Separator className="col-span-4 my-4" />

          <div className="col-span-1">
            <span className="text-muted-foreground">Fee Payer</span>
          </div>
          <div className="col-span-3">
            {transaction?.transaction.message.accountKeys[0].pubkey && (
              <Address short={false}>
                {transaction?.transaction.message.accountKeys[0].pubkey}
              </Address>
            )}
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Transaction Fee</span>
          </div>
          <div className="col-span-3">
            {transaction?.meta?.fee && (
              <span>{transaction?.meta?.fee / 1e9} SOL</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
