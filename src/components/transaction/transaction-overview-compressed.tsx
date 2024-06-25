import { CompressedTransaction } from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import { Package } from "lucide-react";

import {
  dateFormat,
  lamportsToSolString,
  timeAgoWithFormat,
} from "@/lib/utils";

import Address from "@/components/common/address";
import Signature from "@/components/common/signature";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TransactionCompressed({
  data,
}: {
  data: CompressedTransaction;
}) {
  const { compressionInfo, transaction } = data;

  return (
    <Card className="w-full max-w-lg mx-auto p-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="h-6 w-6" />
          <CardTitle className="text-2xl font-bold">Compression</CardTitle>
          <Badge
            className="text-xs py-1 px-2"
            variant={transaction.meta?.err === null ? "success" : "destructive"}
          >
            {transaction.meta?.err === null ? "Success" : "Failed"}
          </Badge>
        </div>
        <div className="flex flex-col text-right">
          <span>{timeAgoWithFormat(transaction.blockTime!, true)}</span>
          <span className="text-xs text-muted-foreground">
            {dateFormat(transaction.blockTime!)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {compressionInfo.openedAccounts
          .filter((item) => item.account.lamports > 0)
          .map((item, index) => (
            <div
              key={`opened-accounts-${index}`}
              className="flex items-center gap-2"
            >
              Opened account
              <Address pubkey={new PublicKey(item.account.hash)} />
              {` with ${lamportsToSolString(item.account.lamports, 7)} SOL`}
            </div>
          ))}
        {compressionInfo.closedAccounts
          .filter((item) => item.account.lamports > 0)
          .map((item, index) => (
            <div
              key={`closed-accounts-${index}`}
              className="flex items-center gap-2"
            >
              Closed account
              <Address pubkey={new PublicKey(item.account.hash)} />
              {` with ${lamportsToSolString(item.account.lamports, 7)} SOL`}
            </div>
          ))}

        <Separator />

        {/* <div className="flex items-center">
          <span className="w-1/4 text-muted-foreground">Signature</span>
          <div className="w-3/4 flex items-center space-x-2">
            <Signature link={false}>
              {transaction}
            </Signature>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
