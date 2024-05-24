"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle, RotateCw } from "lucide-react";
import { useMemo } from "react";

import { compressions } from "@/lib/data";
import { timeAgoWithFormat } from "@/lib/utils";

import { Result } from "@/schemas/getSignaturesForAddress";

import { useGetCompressionSignaturesForOwner } from "@/hooks/compression";
import { useGetSignaturesForAddress } from "@/hooks/web3";

import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import Loading from "@/components/loading";
import Signature from "@/components/signature";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Transactions({ address }: { address: string }) {
  type Transaction = {
    slot: number;
    signature: string;
    err: object | null;
    blockTime: number | null;
    compression: boolean;
  };

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
          <Signature short={false}>{row.getValue("signature")}</Signature>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "compression",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Compression" />
        ),
        cell: ({ row }) => {
          const compression = compressions.find(
            (compression) => compression.value === row.getValue("compression"),
          );

          if (!compression) {
            return null;
          }

          return (
            <div className="flex w-[100px] items-center">
              {compression.icon && (
                <compression.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span>{compression.label}</span>
            </div>
          );
        },
        enableSorting: true,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
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

  const { data, refetch } = useGetSignaturesForAddress(address);

  const {
    data: dataCompressions,
    isLoading,
    isFetching,
    isPending,
    isError,
  } = useGetCompressionSignaturesForOwner(address, !!data);

  // TODO: Refactor jsx
  if (isError)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Transaction History</CardTitle>
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
          <div>Failed to load</div>
        </CardContent>
      </Card>
    );
  if (isLoading || isPending || isFetching)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Transaction History</CardTitle>
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

  // Check if there are any compression signatures
  const signatures: Transaction[] | undefined = data?.result.map(
    (item: Result): Transaction => ({
      slot: item.slot,
      signature: item.signature,
      err: item.err,
      blockTime: item.blockTime,
      compression: dataCompressions?.result.value.items.some(
        (compressionItem) => compressionItem.signature === item.signature,
      )
        ? true
        : false,
    }),
  );

  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Transaction History</CardTitle>
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
        <DataTable data={signatures!} columns={columns} />
      </CardContent>
    </Card>
  );
}
