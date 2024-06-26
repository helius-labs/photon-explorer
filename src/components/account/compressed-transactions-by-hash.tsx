"use client";

import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { timeAgoWithFormat } from "@/utils/common";

import { useGetSignaturesForCompressedAccount } from "@/hooks/compression";

import Loading from "@/components/common/loading";
import Signature from "@/components/common/signature";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function CompressedTransactionsByHash({
  hash,
}: {
  hash: string;
}) {
  const columns = useMemo<ColumnDef<SignatureWithMetadata>[]>(
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
        cell: ({ row }) => <Signature signature={row.getValue("signature")} />,
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
    useGetSignaturesForCompressedAccount(hash);

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
