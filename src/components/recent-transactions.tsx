"use client";

import { CircleHelp, RotateCw, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Address from "@/components/address";
import Signature from "@/components/signature";
import { useGetBlock, useGetSlot } from "@/lib/web3";
import { timeAgoWithFormat } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function RecentTransactions() {
  // Get latest slot from cluster
  const { slot, isError: slotError, refetch } = useGetSlot();

  // Get block for slot to get the transactions
  // The query will not execute until the slot exists
  const { block, isLoading, isPending, isError } = useGetBlock(slot, !!slot);

  // TODO: Refactor jsx
  if (isError || slotError)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Recent Transactions</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            <RotateCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div>There was a problem loading the recent transactions.</div>
        </CardContent>
      </Card>
    );
  if (isLoading || isPending)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Recent Transactions</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
            Loading
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div>Loading...</div>
        </CardContent>
      </Card>
    );
  if (!block || !block.transactions.length)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Recent Transactions</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            <RotateCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div>No transactions found</div>
        </CardContent>
      </Card>
    );

  // TODO: Use DataTable instead of Table for better pagination, sorting, and filtering
  // Capped transactions at 50 for performance reasons for now

  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Transactions</CardTitle>
        </div>
        <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
          <RotateCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  <Popover>
                    <PopoverTrigger>
                      <CircleHelp className="mr-1 h-3.5 w-3.5" />
                      <span className="sr-only">
                        What does this column mean?
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-80">
                      <p className="mb-2">
                        The period of time for which each leader ingests
                        transactions and produces a block.
                      </p>
                      <p>
                        Collectively, slots create a logical clock. Slots are
                        ordered sequentially and non-overlapping, comprising
                        roughly equal real-world time as per PoH.
                      </p>
                    </PopoverContent>
                  </Popover>
                  <span>Slot</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <Popover>
                    <PopoverTrigger>
                      <CircleHelp className="mr-1 h-3.5 w-3.5" />
                      <span className="sr-only">
                        What does this column mean?
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-80">
                      <p>
                        The first signature in a transaction, which can be used
                        to uniquely identify the transaction across the complete
                        ledger.
                      </p>
                    </PopoverContent>
                  </Popover>
                  <span className="mr-1">Signature</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <Popover>
                    <PopoverTrigger>
                      <CircleHelp className="mr-1 h-3.5 w-3.5" />
                      <span className="sr-only">
                        What does this column mean?
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-80">
                      <p>
                        Transactions include one or more digital signatures each
                        corresponding to an account address referenced by the
                        transaction. Each of these addresses must be the public
                        key of an ed25519 keypair, and the signature signifies
                        that the holder of the matching private key signed, and
                        thus, &quot;authorized&quot; the transaction. In this
                        case, the account is referred to as a signer.
                      </p>
                    </PopoverContent>
                  </Popover>
                  <span>Signer</span>
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.transactions.slice(0, 50).map((data: any) => (
              <TableRow key={data.transaction.signatures[0]}>
                <TableCell>{block.blockHeight}</TableCell>
                <TableCell>
                  <Signature>{data.transaction.signatures[0]}</Signature>
                </TableCell>
                <TableCell>
                  <Address>
                    {data.transaction.message.accountKeys[0].pubkey}
                  </Address>
                </TableCell>
                <TableCell>
                  <Badge className="text-xs" variant="outline">
                    {data.meta?.err === null ? "Success" : "Failed"}
                  </Badge>
                </TableCell>
                <TableCell>{data.meta?.fee / 1e9} SOL</TableCell>
                <TableCell>
                  {timeAgoWithFormat(block.blockTime, true)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
