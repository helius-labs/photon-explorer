"use client";

import { NFT } from "@/types/nft";
import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useState } from "react";

import { NFTGridItem } from "../common/nft-items";
import { NFTGridPagination } from "./data-table-nft-grid-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onQuickView: (nftData: NFT) => void;
}

export function NFTGridTable<TData, TValue>({
  columns,
  data,
  onQuickView,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const sortedRows = useMemo(() => {
    return [...table.getRowModel().rows].sort((a, b) => {
      const aName = (a.original as NFT).name?.toLowerCase() ?? "";
      const bName = (b.original as NFT).name?.toLowerCase() ?? "";

      return aName.localeCompare(bName);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getRowModel().rows]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedRows.length > 0 ? (
          sortedRows.map((row) => (
            <NFTGridItem
              key={row.id}
              nft={row.original as NFT}
              onQuickView={onQuickView}
            />
          ))
        ) : (
          <div className="col-span-full text-center">No results.</div>
        )}
      </div>
      <NFTGridPagination table={table} />
    </div>
  );
}
