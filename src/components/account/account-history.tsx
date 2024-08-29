"use client";

import { useCluster } from "@/providers/cluster-provider";
import { getParsedTransactions } from "@/server/getParsedTransactions";
import { Cluster } from "@/utils/cluster";
import { XrayTransaction } from "@/utils/parser";
import { ParserTransactionTypes } from "@/utils/parser";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import {
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
} from "@solana/web3.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

import { useGetSignaturesForAddress } from "@/hooks/useGetSignaturesForAddress";

import { TransactionCard } from "@/components/account/transaction-card";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";

import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

type TransactionData =
  | ConfirmedSignatureInfo
  | SignatureWithMetadata
  | XrayTransaction
  | ParsedTransactionWithMeta;

interface AccountHistoryProps {
  address: string;
}

const INITIAL_PAGE_SIZE = 10;
const INITIAL_FETCH_LIMIT = 500;
const ADDITIONAL_FETCH_LIMIT = 200;
const PREFETCH_THRESHOLD = 2;

export default function AccountHistory({ address }: AccountHistoryProps) {
  const { cluster, endpoint } = useCluster();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: INITIAL_PAGE_SIZE,
  });
  const [allSignatures, setAllSignatures] = useState<TransactionData[]>([]);
  const [lastSignature, setLastSignature] = useState<string | undefined>(
    undefined,
  );
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0]));
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);

  const [remountKey, setRemountKey] = useState(0);

  const memoizedAddress = useMemo(() => address, [address]);
  const memoizedCluster = useMemo(() => cluster, [cluster]);

  const [typeFilter, setTypeFilter] = useState<ParserTransactionTypes | null>(
    null,
  );

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    setPagination({ pageIndex: 0, pageSize: INITIAL_PAGE_SIZE });
    setIsInitialDataLoaded(false);
    setAllSignatures([]);
    setLastSignature(undefined);
    setHasMoreTransactions(true);
  }, [typeFilter, dateRange]);

  const {
    data: newSignatures,
    refetch: refetchSignatures,
    error,
  } = useGetSignaturesForAddress(
    memoizedAddress,
    INITIAL_FETCH_LIMIT,
    lastSignature,
    !isInitialDataLoaded,
    dateRange?.from,
    dateRange?.to,
  );

  // Add logging for newSignatures
  useEffect(() => {
    console.log("New signatures:", newSignatures);
  }, [newSignatures]);

  // Add logging for error
  useEffect(() => {
    if (error) {
      console.error("Error from useGetSignaturesForAddress:", error);
    }
  }, [error]);

  const fetchSignatures = useCallback(async () => {
    if (!hasMoreTransactions) return [];

    try {
      await refetchSignatures();

      if (error) {
        throw error;
      }

      if (newSignatures && newSignatures.length > 0) {
        console.log("Fetched new signatures:", newSignatures);
        setAllSignatures((prev) => [...prev, ...newSignatures]);
        setLastSignature(newSignatures[newSignatures.length - 1].signature);
      } else {
        console.log("No more signatures to fetch");
        setHasMoreTransactions(false);
      }

      return newSignatures || [];
    } catch (error) {
      console.error("Error in fetchSignatures:", error);
      throw error;
    }
  }, [refetchSignatures, newSignatures, error, hasMoreTransactions]);

  useEffect(() => {
    if (!isInitialDataLoaded && newSignatures) {
      setAllSignatures(newSignatures);
      setLastSignature(newSignatures[newSignatures.length - 1].signature);
      setIsInitialDataLoaded(true);
    }
  }, [newSignatures, isInitialDataLoaded]);

  const fetchTransactions = useCallback(
    async (pageIndex: number, pageSize: number) => {
      const startIndex = pageIndex * pageSize;
      let endIndex = startIndex + pageSize;

      let result: TransactionData[] = [];
      let currentIndex = startIndex;

      while (result.length < pageSize && currentIndex < allSignatures.length) {
        if (
          currentIndex + pageSize > allSignatures.length &&
          hasMoreTransactions
        ) {
          await fetchSignatures();
        }

        const batchSignatures = allSignatures
          .slice(currentIndex, currentIndex + pageSize)
          .map((sig) => {
            if ("signature" in sig) return sig.signature;
            if ("transaction" in sig && sig.transaction.signatures.length > 0) {
              return sig.transaction.signatures[0];
            }
            return "";
          });

        // Log the date range and the signatures being processed
        console.log("Current date range:", dateRange);
        console.log("Processing signatures:", batchSignatures);

        let parsedTransactions: TransactionData[] | null = null;
        if ([Cluster.MainnetBeta, Cluster.Devnet].includes(memoizedCluster)) {
          parsedTransactions = await getParsedTransactions(
            batchSignatures,
            memoizedCluster,
          );
        }

        for (let i = 0; i < batchSignatures.length; i++) {
          const transaction =
            parsedTransactions && parsedTransactions[i]
              ? parsedTransactions[i]
              : allSignatures[currentIndex + i];

          // Log the transaction date for debugging
          if ("blockTime" in transaction) {
            console.log(
              "Transaction date:",
              new Date(transaction.blockTime ?? 0 * 1000),
            );
          }

          if (!typeFilter || (transaction as any).type === typeFilter) {
            result.push(transaction);
            if (result.length === pageSize) break;
          }
        }

        currentIndex += pageSize;
      }

      setLoadedPages((prev) => new Set(prev).add(pageIndex));

      queryClient.setQueryData(
        [
          "transactions",
          memoizedAddress,
          pageIndex,
          remountKey,
          typeFilter,
          dateRange,
        ],
        result,
      );
      return result;
    },
    [
      allSignatures,
      memoizedCluster,
      fetchSignatures,
      hasMoreTransactions,
      queryClient,
      memoizedAddress,
      remountKey,
      typeFilter,
      dateRange,
    ],
  );

  useEffect(() => {
    setRemountKey((prev) => prev + 1);
    setIsInitialDataLoaded(false);
  }, [address]);

  const queryKey = useMemo(
    () => [
      "transactions",
      memoizedAddress,
      memoizedCluster,
      pagination.pageIndex,
      remountKey,
      typeFilter,
      dateRange,
    ],
    [
      memoizedAddress,
      memoizedCluster,
      pagination.pageIndex,
      remountKey,
      typeFilter,
      dateRange,
    ],
  );

  const { data, isLoading, isError } = useQuery<TransactionData[]>({
    queryKey,
    queryFn: () => {
      return fetchTransactions(pagination.pageIndex, pagination.pageSize);
    },
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const existingData =
        queryClient.getQueryData<TransactionData[]>(queryKey);
      return existingData || undefined;
    },
    enabled: isInitialDataLoaded,
  });

  useEffect(() => {
    if (data) {
      const prefetchPages = async () => {
        const currentPage = pagination.pageIndex;
        for (let i = 1; i <= 2; i++) {
          const pageIndex = currentPage + i;
          const prefetchQueryKey = [
            "transactions",
            memoizedAddress,
            memoizedCluster,
            pageIndex,
            remountKey,
            typeFilter,
            dateRange,
          ];
          const cachedData =
            queryClient.getQueryData<TransactionData[]>(prefetchQueryKey);

          if (!cachedData) {
            await queryClient.prefetchQuery<TransactionData[]>({
              queryKey: prefetchQueryKey,
              queryFn: () => fetchTransactions(pageIndex, pagination.pageSize),
              staleTime: 5 * 60 * 1000,
            });
          } else {
            queryClient.setQueryData(prefetchQueryKey, cachedData);
            setLoadedPages((prev) => new Set(prev).add(pageIndex));
          }
        }
      };

      prefetchPages();
    }
  }, [
    data,
    pagination.pageIndex,
    pagination.pageSize,
    queryClient,
    fetchTransactions,
    memoizedAddress,
    memoizedCluster,
    remountKey,
    typeFilter,
    dateRange,
  ]);

  const handlePageChange = (newPageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: newPageIndex }));

    const remainingPages = Math.floor(
      (allSignatures.length - (newPageIndex + 1) * pagination.pageSize) /
        pagination.pageSize,
    );
    if (remainingPages <= PREFETCH_THRESHOLD && hasMoreTransactions) {
      fetchSignatures();
    }
  };

  const handleReturn = () => {
    router.push(`/?cluster=${memoizedCluster}`);
  };

  if (isError) {
    return (
      <Card className="col-span-12 mx-[-1rem] overflow-hidden md:mx-0">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-6">
            <div className="text-lg text-muted-foreground">
              Failed to load transaction history.
            </div>
            <Button variant="outline" className="mt-4" onClick={handleReturn}>
              Return
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !isInitialDataLoaded) {
    return <LoadingSkeleton pageSize={pagination.pageSize} />;
  }

  return (
    <Card className="col-span-12 mx-[-1rem] mb-10 overflow-hidden md:mx-0">
      <CardContent className="pt-6">
        {data && data.length > 0 ? (
          <>
            <div className="mb-4 flex justify-between">
              <DateRangePicker
                onDateRangeChange={(start, end) => {
                  setDateRange({
                    from: start || undefined,
                    to: end || undefined,
                  });
                }}
              />
              <TypeFilter value={typeFilter} onChange={setTypeFilter} />
            </div>
            <TransactionCard
              data={data}
              pagination={pagination}
              onPageChange={handlePageChange}
              loadedPages={loadedPages}
            />
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            No transaction history found for this address.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton({ pageSize }: { pageSize: number }) {
  const skeletonRows = Array.from({ length: pageSize }, (_, i) => (
    <div key={i}>
      <div className="flex flex-col justify-between px-6 py-3 md:flex-row md:items-center">
        {/* Type Section Skeleton */}
        <div className="mb-4 flex flex-1 items-center space-x-2 md:mb-0">
          <Skeleton className="h-7 w-7 rounded-[8px]" />
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-5 w-32" /> {/* Title Skeleton */}
            <Skeleton className="h-3 w-24" /> {/* Timestamp Skeleton */}
          </div>
        </div>
        {/* Balance Changes Section Skeleton with Circle */}
        <div className="flex flex-1 items-center justify-center space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" /> {/* Circle Skeleton */}
          <Skeleton className="h-4 w-36 md:w-28" /> {/* Info Text Skeleton */}
        </div>
        {/* Signature Section Skeleton */}
        <div className="flex flex-1 items-center justify-center">
          <Skeleton className="h-4 w-32 md:w-24" /> {/* Signature Skeleton */}
        </div>
      </div>
      {i < pageSize - 1 && <div className="border-bg-popover border-t" />}
    </div>
  ));

  return (
    <Card className="col-span-12 mx-[-1rem] overflow-hidden md:mx-0">
      <CardContent className="pt-4">
        <div className="hidden items-center border-b p-6 md:flex">
          <div className="flex flex-1 justify-start">
            <Skeleton className="h-4 w-16 md:ml-6" /> {/* Type Header */}
          </div>
          <div className="flex flex-1 justify-center">
            <Skeleton className="h-4 w-32" /> {/* Centered Info Header */}
          </div>
          <div className="flex flex-1 justify-center">
            <Skeleton className="h-4 w-24" /> {/* Signature Header */}
          </div>
        </div>
        {/* Data Row Skeletons */}
        <div className="flex flex-col space-y-4">{skeletonRows}</div>
        {/* Pagination Skeleton */}
        <div className="mt-2 flex items-center justify-center">
          <div className="flex space-x-4">
            <Skeleton className="h-7 w-7 rounded-full" /> {/* Left Arrow */}
            <Skeleton className="h-7 w-16" /> {/* Page Number */}
            <Skeleton className="h-7 w-7 rounded-full" /> {/* Right Arrow */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TypeFilter({
  value,
  onChange,
}: {
  value: ParserTransactionTypes | null;
  onChange: (value: ParserTransactionTypes | null) => void;
}) {
  return (
    <select
      value={value || ""}
      onChange={(e) =>
        onChange((e.target.value as ParserTransactionTypes) || null)
      }
      className="rounded border p-2"
    >
      <option value="">All Types</option>
      {Object.values(ParserTransactionTypes).map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
  );
}
