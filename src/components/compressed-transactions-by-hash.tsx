"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle, RotateCw } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";

import { timeAgoWithFormat } from "@/lib/utils";

import { itemSchema } from "@/schemas/getCompressionSignaturesForAccount";

import { useGetCompressionSignaturesForAccount } from "@/hooks/compression";

import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import Loading from "@/components/loading";
import Signature from "@/components/signature";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompressedTransactionsByHash({
  hash,
}: {
  hash: string;
}) {
  type Item = z.infer<typeof itemSchema>;

  const columns = useMemo<ColumnDef<Item>[]>(
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
        accessorKey: "err",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <Badge className="text-xs" variant="outline">
            Success
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

  const { data, isLoading, isFetching, isError, refetch } =
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

  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Compressed Transaction History</CardTitle>
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
        <DataTable data={data?.result.value.items!} columns={columns} />
      </CardContent>
    </Card>
  );
}
