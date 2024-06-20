import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { CircleHelp } from "lucide-react";

import { ActionTypes, ParserTransactionTypes } from "@/lib/parser";
import { dateFormat, timeAgoWithFormat } from "@/lib/utils";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";

import Address from "@/components/common/address";
import Signature from "@/components/common/signature";
import { TokenBalance } from "@/components/common/token-balance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TransactionOverview({
  data,
}: {
  data: ParsedTransactionWithMeta;
}) {
  const { meta, transaction, blockTime, slot, version } = data;

  return (
    <Card className="w-full max-w-lg mx-auto p-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <CircleHelp className="h-6 w-6" />
          <CardTitle className="text-2xl font-bold">UNKNOWN</CardTitle>
        </div>
        <div className="flex flex-col text-right">
          <span>{timeAgoWithFormat(blockTime!, true)}</span>
          <span className="text-xs text-muted-foreground">
            {dateFormat(blockTime!)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <span className="w-1/4 text-muted-foreground">Signature</span>
          <div className="w-3/4 flex items-center space-x-2">
            <Signature link={false}>{transaction.signatures[0]}</Signature>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
