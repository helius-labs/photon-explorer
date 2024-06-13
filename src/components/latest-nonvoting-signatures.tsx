"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle, RotateCw } from "lucide-react";
import { useMemo } from "react";

import { compressions, statuses } from "@/lib/data";
import { timeAgoWithFormat } from "@/lib/utils";

import { Item } from "@/schemas/getLatestNonVotingSignatures";

import {
  useGetLatestCompressionSignatures,
  useGetLatestNonVotingSignatures,
} from "@/hooks/compression";

import Loading from "@/components/common/loading";
import Signature from "@/components/common/signature";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LatestNonVotingSignatures() {
  type Transaction = {
    slot: number;
    signature: string;
    status: boolean;
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
        cell: ({ row }) => <Signature>{row.getValue("signature")}</Signature>,
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

  const { data, refetch } = useGetLatestNonVotingSignatures();

  const {
    data: dataCompressions,
    isLoading,
    isPending,
    isFetching,
    isError,
  } = useGetLatestCompressionSignatures(!!data);

  // Check if there are any compression signatures
  const signatures: Transaction[] | undefined = data?.result.value.items?.map(
    (item: Item): Transaction => ({
      slot: item.slot,
      signature: item.signature,
      status: true,
      blockTime: item.blockTime,
      compression: dataCompressions?.result.value.items.some(
        (compressionItem) => compressionItem.signature === item.signature,
      )
        ? true
        : false,
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
      className={`min-h-[400px] transition-opacity duration-700 ease-in-out ${isPending ? "opacity-0" : "opacity-100"}`}
    >
      {signatures && <DataTable data={signatures!} columns={columns} />}
    </div>
  );
}
