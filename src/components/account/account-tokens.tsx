"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle, RotateCw } from "lucide-react";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { Token } from "@/types/token";
import Address from "@/components/common/address";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import Loading from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetTokensByOwner } from "@/hooks/useGetTokensByOwner";
import { normalizeTokenAmount } from "@/utils/common";
import { compressions } from "@/utils/data";

export default function AccountTokens({ address }: { address: string }) {
  const columns = useMemo<ColumnDef<Token>[]>(
    () => [
      {
        accessorKey: "address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Account address" />
        ),
        cell: ({ row }) => (
          <Address pubkey={new PublicKey(row.getValue("address"))} />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "mint",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Mint address" />
        ),
        cell: ({ row }) => (
          <Address pubkey={row.original.mint} />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Balance" className="justify-center" />
        ),
        cell: ({ row }) => (
          <div className="text-right mr-8">
            {normalizeTokenAmount(row.original.amount, row.original.decimals).toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 9,
            })}
          </div>
        ),

        sortingFn: (rowA, rowB) => {
          const amountA = normalizeTokenAmount(rowA.original.amount, rowA.original.decimals);
          const amountB = normalizeTokenAmount(rowB.original.amount, rowB.original.decimals);
          if (amountA === amountB) return 0;
          return amountA > amountB ? 1 : -1;
        },
        enableSorting: true,
      },
      {
        accessorKey: "symbol",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Symbol" />
        ),
        cell: ({ row }) => (
          <span>{row.original.symbol || "-"}</span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "compressed",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Compressed" />
        ),
        cell: ({ row }) => {
          const compression = compressions.find(
            (compression) => compression.value === row.getValue("compressed"),
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

    ],
    [],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetTokensByOwner(address);


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
        <DataTable data={data!} columns={columns} />
      </CardContent>
    </Card>
  );
}
