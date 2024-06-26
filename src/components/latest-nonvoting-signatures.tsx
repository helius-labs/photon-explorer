"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { timeAgoWithFormat } from "@/utils/common";
import { statuses } from "@/utils/data";

import { useGetLatestNonVotingSignatures } from "@/hooks/compression";

import Signature from "@/components/common/signature";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Card, CardContent } from "@/components/ui/card";

export default function LatestNonVotingSignatures() {
  type Transaction = {
    signature: string;
    status: boolean;
    blockTime: number | null;
  };

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "signature",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Signature" />
        ),
        cell: ({ row }) => <Signature signature={row.getValue("signature")} />,
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = statuses.find(
            (status) => status.value === row.getValue("status"),
          );

          if (!status) {
            return null;
          }

          return (
            <div className="flex w-[100px] items-center">
              {status.icon && (
                <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span>{status.label}</span>
            </div>
          );
        },
        enableSorting: true,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
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

  const { data, isLoading, isPending, isFetching, isError, refetch } =
    useGetLatestNonVotingSignatures();

  // Check if there are any compression signatures
  const signatures: Transaction[] | undefined = data?.result.value.items?.map(
    (item): Transaction => ({
      signature: item.signature,
      status: true,
      blockTime: item.blockTime,
    }),
  );

  // TODO: Refactor jsx
  if (isError)
    return (
      <Card>
        <CardContent className="pt-6">
          <div>Failed to load</div>
        </CardContent>
      </Card>
    );

  return (
    <div
      className={`min-h-[400px] transition-opacity border rounded-md p-2 duration-700 ease-in-out ${isPending ? "opacity-0" : "opacity-100"}`}
    >
      {signatures && <DataTable data={signatures!} columns={columns} />}
    </div>
  );
}
