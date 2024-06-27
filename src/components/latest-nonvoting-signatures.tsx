"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { statuses } from "@/utils/data";
import { timeAgoWithFormat } from "@/utils/common";

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
          <DataTableColumnHeader column={column} title="Status" className="hidden md:table-cell" />
        ),
        cell: ({ row }) => {
          const status = statuses.find(
            (status) => status.value === row.getValue("status"),
          );

          if (!status) {
            return null;
          }

          return (
            <div className="flex justify-center md:justify-start hidden md:flex">
              {status.icon && (
                <status.icon className="mr-2 h-6 w-6 text-muted-foreground" />
              )}
              <span className="hidden md:inline">{status.label}</span>
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
      <Card className="mx-5 md:mx-0 mb-16 md:mb-0">
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
    <Card className="mx-auto mb-16 md:mb-0 border" style={{ maxWidth: '90vw' }}>
      <CardContent className="pt-4">
        <div className="flex justify-center text-sm text-secondary mb-2">
          Recent transactions
        </div>
        <div className={`transition-opacity duration-700 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"}`}>
          <div className="md:hidden h-72">
            <ScrollArea className="h-full">
              <div className="flex justify-center">
                <DataTable data={signatures!} columns={columns} />
              </div>
            </ScrollArea>
          </div>
          <div className="hidden md:block">
            <div className="flex justify-center overflow-x-auto">
              <DataTable data={signatures!} columns={columns} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
