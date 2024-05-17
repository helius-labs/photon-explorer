"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle, RotateCw } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";

import { valueSchema } from "@/schemas/getTokenAccountsByOwner";

import { useGetTokenAccountsByOwner } from "@/hooks/web3";

import Address from "@/components/address";
import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TokenAccounts({ address }: { address: string }) {
  type Value = z.infer<typeof valueSchema>;

  const columns = useMemo<ColumnDef<Value>[]>(
    () => [
      {
        accessorKey: "pubkey",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Account address" />
        ),
        cell: ({ row }) => (
          <Address short={false}>{row.original.pubkey}</Address>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "account.data.parsed.info.mint",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Mint address" />
        ),
        cell: ({ row }) => (
          <Address short={false}>
            {row.original.account.data.parsed.info.mint}
          </Address>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "account.data.parsed.info.tokenAmount.uiAmount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Balance" />
        ),
        cell: ({ row }) =>
          row.original.account.data.parsed.info.tokenAmount?.uiAmount.toFixed(
            9,
          ),
        enableSorting: true,
      },
    ],
    [],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetTokenAccountsByOwner(address);

  // TODO: Refactor jsx
  if (isError)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Token Accounts</CardTitle>
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
            <CardTitle>Token Accounts</CardTitle>
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
          <CardTitle>Token Accounts</CardTitle>
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
        <DataTable data={data?.result?.value!} columns={columns} />
      </CardContent>
    </Card>
  );
}
