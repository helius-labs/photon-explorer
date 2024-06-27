"use client";

import { CompressedAccountWithMerkleContext } from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { lamportsToSolString } from "@/lib/utils";

import { useGetCompressedAccountsByOwner } from "@/hooks/compression";

import Address from "@/components/common/address";
import Loading from "@/components/common/loading";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Card, CardContent } from "@/components/ui/card";

export default function CompressedAccounts({ address }: { address: string }) {
  const columns = useMemo<ColumnDef<CompressedAccountWithMerkleContext>[]>(
    () => [
      {
        accessorKey: "hash",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Hash" />
        ),
        cell: ({ row }) => (
          <Address pubkey={new PublicKey(row.getValue("hash"))} />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "address",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Address" />
        ),
        cell: ({ row }) => {
          if (row.getValue("address")) {
            return <Address pubkey={new PublicKey(row.getValue("address"))} />;
          } else {
            return <>-</>;
          }
        },
        enableSorting: true,
      },
      {
        accessorKey: "owner",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Owner" />
        ),
        cell: ({ row }) => (
          <Address pubkey={new PublicKey(row.getValue("owner"))} />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "lamports",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) =>
          `${lamportsToSolString(row.getValue("lamports") as number, 7)} SOL`,
        enableSorting: true,
      },
    ],
    [],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetCompressedAccountsByOwner(address);

  // TODO: Refactor jsx
  if (isError)
    return (
      <Card className="col-span-12">
        <CardContent className="pt-6">
          <div>Failed to load</div>
        </CardContent>
      </Card>
    );
  if (isLoading)
    return (
      <Card className="col-span-12">
        <CardContent className="pt-6">
          <Loading />
        </CardContent>
      </Card>
    );

  return <DataTable data={data!} columns={columns} />;
}
