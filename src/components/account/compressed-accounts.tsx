"use client";

import { lamportsToSolString } from "@/utils/common";
import { CompressedAccountWithMerkleContext } from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import { ColumnDef } from "@tanstack/react-table";

import { useGetCompressedAccountsByOwner } from "@/hooks/compression";

import Address from "@/components/common/address";
import Loading from "@/components/common/loading";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const columns: ColumnDef<CompressedAccountWithMerkleContext>[] = [
  {
    accessorKey: "hash",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hash" />
    ),
    cell: ({ row }) => <Address pubkey={new PublicKey(row.getValue("hash"))} />,
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
];

export default function CompressedAccounts({ address }: { address: string }) {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetCompressedAccountsByOwner(address);

  if (isError)
    return (
      <Card className="col-span-12 overflow-hidden mx-[-1rem] md:mx-0">
        <CardContent className="pt-6 text-center">
          <div className="text-lg font-medium text-red-500">
            Failed to load Compressed Accounts
          </div>
          <div className="mb-4 text-sm text-muted-foreground">
            Try refreshing the page or changing networks.
          </div>
          <Button onClick={() => refetch()} className="mr-2">
            Refresh
          </Button>
        </CardContent>
      </Card>
    );

  if (isLoading)
    return (
      <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
        <CardContent className="flex flex-col gap-4 pb-6 pt-6">
          <Loading />
        </CardContent>
      </Card>
    );

  return (
    <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
      <CardContent className="flex flex-col gap-4 pb-6 pt-6">
        <DataTable data={data!} columns={columns} />
      </CardContent>
    </Card>
  );
}
