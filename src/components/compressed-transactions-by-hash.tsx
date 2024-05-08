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
import Signature from "@/components/signature";
import { useGetCompressionSignaturesForAccount } from "@/lib/web3";
import { Button } from "@/components/ui/button";
import { timeAgoWithFormat } from "@/lib/utils";
import Loading from "@/components/loading";

export default function CompressedTransactionsByHash({
  hash,
}: {
  hash: string;
}) {
  const { compressedSignatures, isLoading, isError, refetch } =
    useGetCompressionSignaturesForAccount(hash);

  // TODO: Refactor jsx
  if (isError)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Compressed Transaction History</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            <RotateCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div>Failed to load</div>
        </CardContent>
      </Card>
    );
  if (isLoading)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Compressed Transaction History</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
            Loading
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <Loading />
        </CardContent>
      </Card>
    );
  if (!compressedSignatures || !compressedSignatures.value.items.length)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Compressed Transaction History</CardTitle>
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
          <CardTitle>Compressed Transaction History</CardTitle>
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
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compressedSignatures.value.items.slice(0, 50).map((data: any) => (
              <TableRow key={data.signature}>
                <TableCell>{data.slot}</TableCell>
                <TableCell>
                  <Signature short={false}>{data.signature}</Signature>
                </TableCell>
                <TableCell>{timeAgoWithFormat(data.blockTime, true)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
