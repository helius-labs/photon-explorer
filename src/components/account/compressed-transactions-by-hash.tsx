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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { useCluster } from "@/providers/cluster-provider";

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
  const router = useRouter();
  const { cluster } = useCluster();
  const handleReturn = () => {
    router.push(`/?cluster=${cluster}`);
  };
  const { data, isLoading, isFetching, isError, refetch } =
    useGetCompressionSignaturesForAccount(hash);

  // TODO: Refactor jsx
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

  return <DataTable data={data!} columns={columns} />;
}
