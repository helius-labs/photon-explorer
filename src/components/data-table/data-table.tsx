"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPageChange?: (newPageIndex: number) => void;
  manualPagination?: boolean;
  loadedPages?: Set<number>;
  lastPageNum?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onPageChange,
  manualPagination = false,
  loadedPages,
  lastPageNum,
}: DataTableProps<TData, TValue>) {
  const [paginationState, setPaginationState] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    manualPagination,
    pageCount: manualPagination ? -1 : undefined,
    state: {
      pagination: manualPagination
        ? pagination || paginationState
        : paginationState,
    },
    onPaginationChange: manualPagination
      ? (updater) => {
          const newPagination =
            typeof updater === "function"
              ? updater(pagination || paginationState)
              : updater;
          onPageChange && onPageChange(newPagination.pageIndex);
        }
      : setPaginationState,
  });

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 overflow-auto pb-2 md:pb-0">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {(manualPagination || !pagination) && (
        <div className="sticky bottom-0 z-10 w-full md:relative md:p-0">
          <div className="block h-4 md:hidden"></div>
          <div className="flex justify-center">
            <DataTablePagination
              table={table}
              onPageChange={manualPagination ? onPageChange : undefined}
              manualPagination={manualPagination}
              loadedPages={loadedPages}
              lastPageNum={lastPageNum}
            />
          </div>
        </div>
      )}
    </div>
  );
}
