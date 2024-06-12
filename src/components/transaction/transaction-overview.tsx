import { CircleHelp, LoaderCircle, RotateCw } from "lucide-react";

import { lamportsToSolString, timeAgoWithFormat } from "@/lib/utils";

import Address from "@/components/common/address";
import Signature from "@/components/common/signature";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Overview</CardTitle>
        </div>
        <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
          {isFetching ? (
            <>
              <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
              Loading
            </>
          ) : (
            <>
              <RotateCw className="mr-1 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
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
            {data?.transaction.signatures[0] && (
              <Signature>{data?.transaction.signatures[0]}</Signature>
            )}
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Status</span>
          </div>
          <div className="col-span-3">
            <Badge className="text-xs" variant="outline">
              {data?.meta?.err === null ? "Success" : "Failed"}
            </Badge>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Slot</span>
          </div>
          <div className="col-span-3">
            <span>#{Number(data?.slot)}</span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Timestamp</span>
          </div>
          <div className="col-span-3">
            <span>
              {data?.blockTime && timeAgoWithFormat(Number(data?.blockTime))}
            </span>
          </div>

          <Separator className="col-span-4 my-4" />

          <div className="col-span-1">
            <span className="text-muted-foreground">Signer</span>
          </div>
          <div className="col-span-3">
            {data?.transaction.message.accountKeys[0].pubkey && (
              <Address>
                {data?.transaction.message.accountKeys[0].pubkey}
              </Address>
            )}
          </div>

          <Separator className="col-span-4 my-4" />

          <div className="col-span-1">
            <span className="text-muted-foreground">Fee Payer</span>
          </div>
          <div className="col-span-3">
            {data?.transaction.message.accountKeys[0].pubkey && (
              <Address>
                {data?.transaction.message.accountKeys[0].pubkey}
              </Address>
            )}
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Transaction Fee</span>
          </div>
          <div className="col-span-3">
            {data?.meta?.fee && (
              <span>{`${lamportsToSolString(data?.meta?.fee, 5)} SOL`}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
