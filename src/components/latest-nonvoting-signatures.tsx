"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { statuses } from "@/lib/data";
import { timeAgoWithFormat } from "@/lib/utils";

import { useGetLatestNonVotingSignatures } from "@/hooks/compression";
import { useCluster } from "@/providers/cluster-provider";

import Signature from "@/components/common/signature";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/common/loading";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LatestNonVotingSignatures() {
  type Transaction = {
    signature: string;
    status: boolean;
    blockTime: number | null;
  };

  const { cluster } = useCluster();

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
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
            <div className="flex w-[80px] md:w-[100px] items-center">
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

  const { data, isLoading, isError } = useGetLatestNonVotingSignatures(cluster === "testnet");

  // Check if there are any compression signatures
  const signatures: Transaction[] | undefined = data?.result.value.items?.map(
    (item): Transaction => ({
      signature: item.signature,
      status: true,
      blockTime: item.blockTime,
    }),
  );

  if (cluster !== "testnet") {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="mx-4 md:mx-0 mb-16 md:mb-0">
        <CardContent className="flex justify-center items-center min-h-[200px] md:min-h-[200px]">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  if (isError || !signatures || signatures.length === 0) {
    return null;
  }

  return (
    <Card className="mx-2 md:mx-0 mb-16 md:mb-0 border">
      <CardContent className="pt-6">
        <div className="flex justify-center text-sm text-secondary mb-4">
          Recent transactions
        </div>
        <div className={`transition-opacity duration-700 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"}`}>
          <div className="md:hidden h-96">
            <ScrollArea className="h-full">
              <DataTable data={signatures!} columns={columns} />
            </ScrollArea>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <DataTable data={signatures!} columns={columns} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
