"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle, RotateCw } from "lucide-react";
import { useMemo } from "react";

import { compressions, statuses } from "@/utils/data";
import { timeAgoWithFormat } from "@/utils/common";

import { useGetCompressionSignaturesForOwner } from "@/hooks/compression";
import { useGetSignaturesForAddress } from "@/hooks/web3";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import Loading from "@/components/common/loading";
import Signature from "@/components/common/signature";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slot } from "@/components/common/slot";
export default function Transactions({ address }: { address: string }) {

    type Transaction = {
        slot: number;
        signature: string;
        status: boolean;
        blockTime: number | null;
        modifiedCompressedAccounts: boolean;
    };

    const columns = useMemo<ColumnDef<Transaction>[]>(
        () => [
            {
                accessorKey: "signature",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Signature" />
                ),
                cell: ({ row }) => (
                    <Signature signature={row.getValue("signature")} truncateChars={60} />
                ),
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
                accessorKey: "modifiedCompressedAccounts",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Compression" />
                ),
                cell: ({ row }) => {
                    const compression = compressions.find(
                        (compression) => compression.value === row.getValue("modifiedCompressedAccounts"),
                    );

                    if (!compression) {
                        return null;
                    }

                    return (
                        <div className="flex w-[100px] items-center">
                            {compression.icon && (
                                <compression.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{compression.label}</span>
                        </div>
                    );
                },
                enableSorting: true,
                filterFn: (row, id, value) => {
                    return value.includes(row.getValue(id));
                },
            },
        ],
        [],
    );

    const signatures = useGetSignaturesForAddress(address, 1000);
    const compresssionSignatures = useGetCompressionSignaturesForOwner(address, !!signatures.data);

    if (signatures.isError || compresssionSignatures.isError)
        return (
            <Card className="col-span-12">
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Transaction History</CardTitle>
                    </div>
                    <Button size="sm" className="ml-auto gap-1" onClick={() => signatures.refetch()}>
                        {signatures.isFetching ? (
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
                <CardContent className="pt-6">
                    <div>Failed to load</div>
                </CardContent>
            </Card>
        );
    if (signatures.isLoading || compresssionSignatures.isLoading)
        return (
            <Card className="col-span-12">
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Transaction History</CardTitle>
                    </div>
                    <Button size="sm" className="ml-auto gap-1" onClick={() => signatures.refetch()}>
                        <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
                        Loading
                    </Button>
                </CardHeader>
                <CardContent className="pt-6">
                    <Loading />
                </CardContent>
            </Card>
        );

    // Check if there are any compression signatures
    const data: Transaction[] | undefined = signatures.data?.map(
        (item): Transaction => ({
            slot: item.slot,
            signature: item.signature,
            status: item.err === null ? true : false,
            blockTime: item.blockTime!,
            modifiedCompressedAccounts: compresssionSignatures.data?.items.some(
                (compressionItem) => compressionItem.signature === item.signature,
            )
                ? true
                : false,
        }),
    );

    return (
        <Card className="col-span-12">
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Transaction History</CardTitle>
                </div>
                <Button size="sm" className="ml-auto gap-1" onClick={() => signatures.refetch()}>
                    {signatures.isFetching ? (
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
