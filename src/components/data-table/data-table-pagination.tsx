import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  onPageChange?: (newPageIndex: number) => void;
  manualPagination?: boolean;
  loadedPages?: Set<number>;
}

export function DataTablePagination<TData>({
  table,
  onPageChange,
  manualPagination = false,
  loadedPages,
}: DataTablePaginationProps<TData>) {
  console.log(
    `DataTablePagination rendered, current page: ${table.getState().pagination.pageIndex}, canNextPage: ${table.getCanNextPage()}, loadedPages:`,
    loadedPages,
  );
  const handlePageChange = (newPageIndex: number) => {
    console.log(`Attempting to change to page ${newPageIndex}`);
    if (loadedPages && !loadedPages.has(newPageIndex)) {
      console.log(`Page ${newPageIndex} is not loaded, cannot change page`);
      return; // Prevent navigation to unloaded pages
    } else {
      console.log(`Page ${newPageIndex} is loaded, changing page`);
    }
    if (manualPagination && onPageChange) {
      onPageChange(newPageIndex);
    } else {
      table.setPageIndex(newPageIndex);
    }
  };

  const isPageLoaded = (pageIndex: number) => {
    const isLoaded = !loadedPages || loadedPages.has(pageIndex);
    console.log(`Checking if page ${pageIndex} is loaded:`, isLoaded);
    return isLoaded;
  };

  const getLastLoadedPage = () => {
    if (!loadedPages) return table.getPageCount() - 1;
    return Math.max(...Array.from(loadedPages));
  };

  const currentPageIndex = table.getState().pagination.pageIndex;
  const lastLoadedPage = getLastLoadedPage();
  const isNextPageLoading = !isPageLoaded(currentPageIndex + 1);
  console.log("isPageLoaded", isPageLoaded(currentPageIndex + 1));
  console.log("isNextPageLoading", isNextPageLoading);

  return (
    <div className="flex items-center justify-between px-4 pt-2">
      <div className="flex-1"></div>
      <div className="flex items-center space-x-2 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(0)}
            disabled={!table.getCanPreviousPage() || !isPageLoaded(0)}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPageIndex - 1)}
            disabled={
              !table.getCanPreviousPage() || !isPageLoaded(currentPageIndex - 1)
            }
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPageIndex + 1}
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPageIndex + 1)}
            disabled={!table.getCanNextPage() || isNextPageLoading}
          >
            <span className="sr-only">
              {isNextPageLoading ? "Loading next page" : "Go to next page"}
            </span>
            {isNextPageLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Button>
          {!isNextPageLoading && (
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(lastLoadedPage)}
              disabled={currentPageIndex >= lastLoadedPage}
            >
              <span className="sr-only">Go to last loaded page</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
