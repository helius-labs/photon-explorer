import { CircleHelp, LoaderCircle, RotateCw } from "lucide-react";
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
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center">
        <CardTitle>Overview</CardTitle>
        <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
          {isFetching ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading
            </>
          ) : (
            <>
              <RotateCw className="h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

        <div className="flex justify-between items-center">
  <span className="text-muted-foreground">Type</span>
  <div className="flex items-center">
    <Badge className="text-xs text-muted-foreground" variant="outline">
      {data?.meta?.err === null ? "Transfer" : "Failed"}
    </Badge>
    <span className="ml-2 text-xs text-muted-foreground">via</span>
    {data?.transaction.message.accountKeys[0].signer && (
      <span className="ml-1 text-xs text-muted-foreground">
        <Address>
          {data?.transaction.message.accountKeys[4].pubkey}
        </Address>
      </span>
    )}
  </div>
</div>


        

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-muted-foreground">Sender</span>
              <Popover>
                <PopoverTrigger>
                  <CircleHelp className="ml-2 h-4 w-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="max-w-xs text-muted-foreground">
                  <p>
                    The signer of the transaction.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            {data?.transaction.message.accountKeys[0].pubkey && (
              <Address>
                {data?.transaction.message.accountKeys[0].pubkey}
              </Address>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Receiver</span>
            {data?.transaction.message.accountKeys[0].signer && (
              <Address>
                {data?.transaction.message.accountKeys[7].pubkey}
              </Address>
            )}
          </div>          
          
        <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            <Badge className="text-xs" variant="success">
              {data?.meta?.err === null ? "Success" : "Failed"}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Timestamp</span>
            <div className="text-right">
              <span>{timeAgo}</span>
              <br />
              <span className="text-xs text-muted-foreground">{formattedDate ? `(${formattedDate}` : ""}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-muted-foreground">Signature</span>
              <Popover>
                <PopoverTrigger>
                  <CircleHelp className="ml-2 h-4 w-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="max-w-xs text-muted-foreground">
                  <p>
                    The first signature in a transaction, which can be used to
                    uniquely identify the transaction across the complete
                    ledger.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            {data?.transaction.signatures[0] && (
              <Signature>{data?.transaction.signatures[0]}</Signature>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Transaction Fee</span>
            {data?.meta?.fee && (
              <span>{`${lamportsToSolString(data?.meta?.fee, 5)} SOL`}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
