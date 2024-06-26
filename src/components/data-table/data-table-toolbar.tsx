"use client";

import { compressions, statuses } from "@/utils/data";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const isSignature = table.getAllColumns().find((x) => x.id === "signature");
  const isCompression = table
    .getAllColumns()
    .find((x) => x.id === "compression");
  const isStatus = table.getAllColumns().find((x) => x.id === "status");

  if (!isSignature && !isCompression && !isStatus) {
    return null;
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {isSignature && (
          <Input
            placeholder="Filter signature..."
            value={
              (table.getColumn("signature")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("signature")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {isCompression && (
          <DataTableFacetedFilter
            column={table.getColumn("compression")}
            title="Compression"
            options={compressions}
          />
        )}
        {isStatus && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
