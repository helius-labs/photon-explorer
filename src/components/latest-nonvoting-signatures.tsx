"use client";

import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { timeAgoWithFormat } from "@/utils/common";
import { statuses } from "@/utils/data";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { useGetLatestNonVotingSignatures } from "@/hooks/compression";

import Loading from "@/components/common/loading";
import Signature from "@/components/common/signature";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Card, CardContent } from "@/components/ui/card";
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
        cell: ({ row }) => <Signature signature={row.getValue("signature")} />,
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Status"
            className="hidden md:table-cell"
          />
        ),
        cell: ({ row }) => {
          const status = statuses.find(
            (status) => status.value === row.getValue("status"),
          );

          if (!status) {
            return null;
          }

          return (
            <div className="hidden items-center justify-center md:flex md:justify-start">
              {status.icon && (
                <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
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

  const { data, isLoading, isError, isPending } =
    useGetLatestNonVotingSignatures(
      [Cluster.Localnet, Cluster.Testnet, Cluster.Custom].includes(cluster),
    );

  if (![Cluster.Localnet, Cluster.Testnet, Cluster.Custom].includes(cluster)) {
    return null;
  }

  const signatures: Transaction[] | undefined = data?.value.items?.map(
    (item): Transaction => ({
      signature: item.signature,
      status: true,
      blockTime: item.blockTime,
    }),
  );

  if (isLoading) {
    return (
      <Card className="mx-5 mb-16 md:mx-0 md:mb-0">
        <CardContent className="flex min-h-[200px] items-center justify-center md:min-h-[200px]">
          <Loading />
        </CardContent>
      </Card>
    );
  }

  if (isError || !signatures || signatures.length === 0) {
    return null;
  }

  return (
    <Card className="mx-auto mb-16 border md:mb-0" style={{ maxWidth: "90vw" }}>
      <CardContent className="pt-4">
        <div className="mb-2 flex justify-center text-sm text-secondary">
          Recent transactions
        </div>
        <div
          className={`transition-opacity duration-700 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"}`}
        >
          <div className="h-72 md:hidden">
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
