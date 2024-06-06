"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle, RotateCw } from "lucide-react";
import { useMemo } from "react";

import { Item } from "@/schemas/getCompressedTokenAccountsByOwner";

import { useGetCompressedTokenAccountsByOwner } from "@/hooks/compression";

import Address from "@/components/address";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompressedTokenAccounts({
  address,
}: {
  address: string;
}) {
  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      {
        accessorKey: "row.original.account.hash",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Account Hash" />
        ),
        cell: ({ row }) => (
          <Address short={false}>{row.original.account.hash}</Address>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "row.original.account.address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Account Address" />
        ),
        cell: ({ row }) => (
          <Address short={false}>{row.original.account.address}</Address>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "row.original.account.owner",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Account Owner" />
        ),
        cell: ({ row }) => (
          <Address short={false}>{row.original.account.owner}</Address>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "row.original.tokenData.mint",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Token Mint" />
        ),
        cell: ({ row }) => (
          <Address short={false}>{row.original.tokenData.mint}</Address>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "row.original.tokenData.owner",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Token Owner" />
        ),
        cell: ({ row }) => (
          <Address short={false}>{row.original.tokenData.owner}</Address>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "row.original.tokenData.amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Token Balance" />
        ),
        cell: ({ row }) =>
          `${Number((row.original.tokenData.amount / 1e9).toFixed(9))} SOL`,
        enableSorting: true,
      },
    ],
    [],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetCompressedTokenAccountsByOwner(address);

  // TODO: Refactor jsx
  if (isError)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Compressed Accounts</CardTitle>
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
            <CardTitle>Compressed Accounts</CardTitle>
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
          <CardTitle>Compressed Accounts</CardTitle>
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
