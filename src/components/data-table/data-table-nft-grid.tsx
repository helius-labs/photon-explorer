"use client";

import { NFT } from "@/types/nft";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import React from "react";
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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  console.log("Table Rows:", table.getRowModel().rows); // Debug statement to check table rows

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {table.getRowModel().rows.length > 0 ? (
          table
            .getRowModel()
            .rows.map((row) => (
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
