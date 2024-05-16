"use client";

import { useGetBlock, useGetSlot } from "@/hooks/web3";
import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle, RotateCw } from "lucide-react";
import { useMemo } from "react";

import { timeAgoWithFormat } from "@/lib/utils";

import { Transaction } from "@/types/transaction";

import Address from "@/components/address";
import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import Loading from "@/components/loading";
import Signature from "@/components/signature";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LatestTransactions() {
  // Get latest slot from cluster
  const { slot, isError: slotError, refetch } = useGetSlot();

  // Get block for slot to get the transactions
  // The query will not execute until the slot exists
  const { block, isLoading, isFetching, isPending, isError } = useGetBlock(
    slot,
    !!slot,
  );

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "slot",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Slot" />
        ),
        cell: ({ row }) => <div>{row.getValue("slot")}</div>,
        enableSorting: true,
      },
      {
        accessorKey: "signature",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Signature" />
        ),
        cell: ({ row }) => (
          <Signature short={true}>{row.getValue("signature")}</Signature>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "signer",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Signature" />
        ),
        cell: ({ row }) => (
          <Address short={true}>{row.getValue("signer")}</Address>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "fee",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Fee" />
        ),
        cell: ({ row }) =>
          `${((row.getValue("fee") as number) / 1e9).toFixed(7)} SOL`,
        enableSorting: true,
      },
      {
        accessorKey: "err",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <Badge className="text-xs" variant="outline">
            {row.getValue("err") === null ? "Success" : "Failed"}
          </Badge>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "blockTime",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Age" />
        ),
        cell: ({ row }) => timeAgoWithFormat(row.getValue("blockTime"), true),
        enableSorting: true,
      },
    ],
    [],
  );

  // TODO: Refactor jsx
  if (isError || slotError)
    return (
      <Card className="min-h-[200px]">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Latest Transactions</CardTitle>
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
        <CardContent className="pt-6">
          <div>There was a problem loading the Latest transactions.</div>
        </CardContent>
      </Card>
    );
  if (isLoading || isPending || isFetching)
    return (
      <Card className="min-h-[200px]">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Latest Transactions</CardTitle>
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

  const signatures: Transaction[] = block.transactions.map((data: any) => ({
    slot: block.blockHeight,
    signature: data.transaction.signatures[0],
    signer: data.transaction.message.accountKeys[0].pubkey,
    err: data.meta?.err,
    fee: data.meta?.fee,
    blockTime: block.blockTime,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Latest Transactions</CardTitle>
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
        <DataTable data={signatures} columns={columns} />
      </CardContent>
    </Card>
  );
}
