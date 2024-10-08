"use client";

import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { timeAgoWithFormat } from "@/utils/common";

import { useGetCompressionSignaturesForAccount } from "@/hooks/compression";

import Loading from "@/components/common/loading";
import Signature from "@/components/common/signature";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCluster } from "@/providers/cluster-provider";
import { LoaderCircle, RotateCw } from "lucide-react";
import { Slot } from "@/components/common/slot";
import { statuses } from "@/utils/data";

export default function CompressedTransactionsByHash({
  hash,
}: {
  hash: string;
}) {
  const columns = useMemo<ColumnDef<SignatureWithMetadata>[]>(
    () => [
      {
        accessorKey: "signature",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Signature" />
        ),
        cell: ({ row }) => <Signature signature={row.getValue("signature")} truncateChars={60} />,
        enableSorting: true,
      },
      {
        accessorKey: "slot",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Block" />
        ),
        cell: ({ row }) => <Slot slot={row.original.slot} />,
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
      {
        accessorKey: "err",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {

          const status = statuses.find(status => status.value === true);

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
      },

    ],
    [],
  );
  const router = useRouter();
  const { cluster } = useCluster();
  const handleReturn = () => {
    router.push(`/?cluster=${cluster}`);
  };
  const { data, isLoading, isFetching, isError, refetch } =
    useGetCompressionSignaturesForAccount(hash);


  if (isError)
    return (
      <Card className="col-span-12 overflow-hidden mx-[-1rem] md:mx-0">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-6">
            <div className="text-muted-foreground text-lg">Failed to load transaction.</div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleReturn}
            >
              Return
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  if (isLoading)
    return (
      <Card className="col-span-12 overflow-hidden mx-[-1rem] md:mx-0">
        <CardContent className="pt-6">
          <Loading />
        </CardContent>
      </Card>
    );

  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Transaction History</CardTitle>
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
