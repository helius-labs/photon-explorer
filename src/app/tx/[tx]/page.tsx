import type { Metadata } from "next";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Transaction Details | Photon Block Explorer",
  description: "",
};

export default function Page({ params }: { params: { tx: string } }) {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Transaction Details
        </h1>
      </div>

      <div className="">
        <div className="grid gap-3">
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
                          The first signature in a transaction, which can be
                          used to uniquely identify the transaction across the
                          complete ledger.
                        </p>
                      </PopoverContent>
                    </Popover>
                    <span className="mr-1 text-muted-foreground">
                      Transaction Hash
                    </span>
                  </div>
                </div>
                <div className="col-span-3">
                  <TransactionHash short={false}>
                    3MrqbKPKZ7b7PmYrKff7kUK9svzJQEEUUGfbhmmNtgKhV98tLf8ruW7myjLYDjcr2ik8eSzopcDvYVppLLNB4Mk9
                  </TransactionHash>
                </div>

                <div className="col-span-1">
                  <span className="text-muted-foreground">Status</span>
                </div>
                <div className="col-span-3">
                  <Badge className="text-xs" variant="outline">
                    Success
                  </Badge>
                </div>

                <div className="col-span-1">
                  <span className="text-muted-foreground">Block</span>
                </div>
                <div className="col-span-3">
                  <span>#260302547</span>
                </div>

                <div className="col-span-1">
                  <span className="text-muted-foreground">Timestamp</span>
                </div>
                <div className="col-span-3">
                  <span>20 hours ago (April 15, 2024 17:14:03 UTC)</span>
                </div>

                <Separator className="col-span-4 my-4" />

                <div className="col-span-1">
                  <span className="text-muted-foreground">Signer</span>
                </div>
                <div className="col-span-3">
                  <Address short={false}>
                    31Sof5r1xi7dfcaz4x9Kuwm8J9ueAdDduMcme59sP8gc
                  </Address>
                </div>

                <Separator className="col-span-4 my-4" />

                <div className="col-span-1">
                  <span className="text-muted-foreground">Fee Payer</span>
                </div>
                <div className="col-span-3">
                  <Address short={false}>
                    31Sof5r1xi7dfcaz4x9Kuwm8J9ueAdDduMcme59sP8gc
                  </Address>
                </div>

                <div className="col-span-1">
                  <span className="text-muted-foreground">Transaction Fee</span>
                </div>
                <div className="col-span-3">
                  <span>0.000005005 SOL</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
