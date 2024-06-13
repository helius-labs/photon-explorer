import { CircleHelp, ArrowRightLeftIcon } from "lucide-react";
import { lamportsToSolString, timeAgoWithFormat } from "@/lib/utils";
import Address from "@/components/common/address";
import Signature from "@/components/common/signature";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export default function TransactionOverview({
  data,
  refetch,
  isFetching,
}: {
  data: any;
  refetch: () => void;
  isFetching: boolean;
}) {
  const blockTime = data?.blockTime ? Number(data.blockTime) : null;
  const formattedTime = blockTime ? timeAgoWithFormat(blockTime) : null;
  const [timeAgo, formattedDate] = formattedTime
    ? formattedTime.split(' (')
    : [null, null];

  const tokenImageUri = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

  return (
    <Card className="w-full max-w-lg mx-auto p-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <ArrowRightLeftIcon className="h-6 w-6 text-muted-foreground" />
          <CardTitle className="text-2xl font-bold">Transfer</CardTitle>
          <Badge className="text-xs py-1 px-2" variant={data?.meta?.err === null ? "success" : "destructive"}>
            {data?.meta?.err === null ? "Success" : "Failed"}
          </Badge>
        </div>
        <div className="flex flex-col text-right">
          <span>{timeAgo}</span>
          <span className="text-xs text-muted-foreground">{formattedDate ? `${formattedDate}` : ""}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <span className="w-1/4 text-muted-foreground">Amount</span>
          <div className="w-3/4 flex items-center">
            <img src={tokenImageUri} alt="Token" className="h-6 w-6 mr-2 rounded-md" />
            <span>2 SOL</span>
          </div>
        </div>
        <div className="flex items-center">
          <span className="w-1/4 text-muted-foreground">Sender</span>
          <div className="w-3/4">
            {data?.transaction.message.accountKeys[0].pubkey && (
              <Address>
                {data?.transaction.message.accountKeys[0].pubkey}
              </Address>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <span className="w-1/4 text-muted-foreground">Receiver</span>
          <div className="w-3/4">
            {data?.transaction.message.accountKeys[0].pubkey && (
              <Address>
                {data?.transaction.message.accountKeys[10].pubkey}
              </Address>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center">
          <span className="w-1/4 text-muted-foreground">Signature</span>
          <div className="w-3/4 flex items-center space-x-2">
            {data?.transaction.signatures[0] && (
              <Signature>{data?.transaction.signatures[0]}</Signature>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
