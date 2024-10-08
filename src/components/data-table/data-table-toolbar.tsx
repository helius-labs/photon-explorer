"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { compressions, compressed, statuses } from "@/utils/data";

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

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {table.getAllColumns().find((x) => x.id === "signature") && (
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
        {table.getAllColumns().find((x) => x.id === "address") && (
          <Input
            placeholder="Filter address..."
            value={
              (table.getColumn("address")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("address")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {table.getAllColumns().find((x) => x.id === "status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getAllColumns().find((x) => x.id === "modifiedCompressedAccounts") && (
          <DataTableFacetedFilter
            column={table.getColumn("modifiedCompressedAccounts")}
            title="Compression"
            options={compressions}
          />
        )}
        {table.getAllColumns().find((x) => x.id === "compressed") && (
          <DataTableFacetedFilter
            column={table.getColumn("compressed")}
            title="Compressed"
            options={compressed}
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
