import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { CircleHelp, Tag } from "lucide-react";

import { dateFormat, timeAgoWithFormat } from "@/lib/utils";

import Address from "@/components/common/address";
import Signature from "@/components/common/signature";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TransactionOverview({
  data,
}: {
  data: ParsedTransactionWithMeta;
}) {
  const { meta, transaction, blockTime } = data;

  return (
    <Card className="w-full max-w-lg mx-auto p-3">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-3 md:space-y-0">
        <div className="flex items-center space-x-3">
          <Tag className="h-6 w-6" />
          <CardTitle className="text-xl md:text-2xl font-bold">Undefined</CardTitle>
          <Badge
            className="text-xs py-1 px-2"
            variant={data?.meta?.err === null ? "success" : "destructive"}
          >
            {meta?.err === null ? "Success" : "Failed"}
          </Badge>
        </div>
        <div className="flex flex-col items-start md:items-end text-left md:text-right">
          <span>{timeAgoWithFormat(blockTime!, true)}</span>
          <span className="text-xs text-muted-foreground">
            {dateFormat(blockTime!)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <span className="font-medium">Signer</span>
          <Address
            link={false}
            pubkey={transaction.message.accountKeys[0].pubkey}
          />
        </div>

        <Separator />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <span className="font-medium">Signature</span>
          <Signature link={false}>{transaction.signatures[0]}</Signature>
        </div>
      </CardContent>
    </Card>
  );
}
