"use client";

import { CircleHelp } from "lucide-react";

import { timeAgoWithFormat } from "@/lib/utils";

import { Result } from "@/schemas/getTransaction";

import Address from "@/components/address";
import Signature from "@/components/signature";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export default function TransactionOverview({ result }: { result: Result }) {
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
              <span className="mr-1 text-muted-foreground">Signature</span>
            </div>
          </div>
          <div className="col-span-3">
            {result?.transaction.signatures[0] && (
              <Signature short={false}>
                {result?.transaction.signatures[0]}
              </Signature>
            )}
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Status</span>
          </div>
          <div className="col-span-3">
            <Badge className="text-xs" variant="outline">
              {result?.meta?.err === null ? "Success" : "Failed"}
            </Badge>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Slot</span>
          </div>
          <div className="col-span-3">
            <span>#{result?.slot}</span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Timestamp</span>
          </div>
          <div className="col-span-3">
            <span>
              {result?.blockTime && timeAgoWithFormat(result?.blockTime)}
            </span>
          </div>

          <Separator className="col-span-4 my-4" />

          <div className="col-span-1">
            <span className="text-muted-foreground">Signer</span>
          </div>
          <div className="col-span-3">
            {result?.transaction.message.accountKeys[0].pubkey && (
              <Address short={false}>
                {result?.transaction.message.accountKeys[0].pubkey}
              </Address>
            )}
          </div>

          <Separator className="col-span-4 my-4" />

          <div className="col-span-1">
            <span className="text-muted-foreground">Fee Payer</span>
          </div>
          <div className="col-span-3">
            {result?.transaction.message.accountKeys[0].pubkey && (
              <Address short={false}>
                {result?.transaction.message.accountKeys[0].pubkey}
              </Address>
            )}
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Transaction Fee</span>
          </div>
          <div className="col-span-3">
            {result?.meta?.fee && (
              <span>{Number((result?.meta?.fee / 1e9).toFixed(7))} SOL</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
