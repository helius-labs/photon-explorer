"use client";

import { useCluster } from "@/providers/cluster-provider";
import { getParsedTransactions } from "@/server/getParsedTransactions";
import { Cluster } from "@/utils/cluster";
import { getSignaturesForAddress } from "@/utils/fetchTxnSigs";
import { XrayTransaction } from "@/utils/parser";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import {
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
} from "@solana/web3.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useGetSignaturesForAddress } from "@/hooks/useGetSignaturesForAddress";

import { TransactionCard } from "@/components/account/transaction-card";
import { Card, CardContent } from "@/components/ui/card";

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
const PREFETCH_THRESHOLD = 2; // Number of pages before running out to trigger a new fetch

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
  const [loadedPages, setLoadedPages] = useState<Set<number>>(() => {
    const stored = localStorage.getItem(`loadedPages-${address}-${cluster}`);
    return stored ? new Set(JSON.parse(stored)) : new Set([0]);
  });
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);

  const [remountKey, setRemountKey] = useState(0);

  const memoizedAddress = useMemo(() => address, [address]);
  const memoizedCluster = useMemo(() => cluster, [cluster]);

  const {
    data: newSignatures,
    refetch: refetchSignatures,
    error,
  } = useGetSignaturesForAddress(
    memoizedAddress,
    INITIAL_FETCH_LIMIT,
    lastSignature,
    !isInitialDataLoaded,
  );

  const fetchSignatures = useCallback(async () => {
    if (!hasMoreTransactions) return [];

    try {
      await refetchSignatures();

      if (error) {
        throw error;
      }

      if (newSignatures && newSignatures.length > 0) {
        setAllSignatures((prev) => [...prev, ...newSignatures]);
        setLastSignature(newSignatures[newSignatures.length - 1].signature);
      } else {
        setHasMoreTransactions(false);
      }

      return newSignatures || [];
    } catch (error) {
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
      const endIndex = startIndex + pageSize;

      const remainingPages = Math.floor(
        (allSignatures.length - endIndex) / pageSize,
      );

      if (remainingPages <= PREFETCH_THRESHOLD && hasMoreTransactions) {
        await fetchSignatures();
      }

      const pageSignatures = allSignatures
        .slice(startIndex, endIndex)
        .map((sig) => {
          if ("signature" in sig) return sig.signature;
          if ("transaction" in sig && sig.transaction.signatures.length > 0) {
            return sig.transaction.signatures[0];
          }
          return "";
        });

      let parsedTransactions: TransactionData[] | null = null;
      if ([Cluster.MainnetBeta, Cluster.Devnet].includes(memoizedCluster)) {
        parsedTransactions = await getParsedTransactions(
          pageSignatures,
          memoizedCluster,
        );
      }

      setLoadedPages((prev) => new Set(prev).add(pageIndex));

      const result = pageSignatures.map((signature, index) =>
        parsedTransactions && parsedTransactions[index]
          ? parsedTransactions[index]
          : allSignatures[startIndex + index],
      );

      // Cache the result for this page
      queryClient.setQueryData(
        ["transactions", memoizedAddress, pageIndex, remountKey],
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
    ],
  );

  const { data, isLoading, isError } = useQuery<TransactionData[]>({
    queryKey: [
      "transactions",
      memoizedAddress,
      pagination.pageIndex,
      remountKey,
    ],
    queryFn: () => fetchTransactions(pagination.pageIndex, pagination.pageSize),
    placeholderData: (previousData) => previousData,
    enabled: isInitialDataLoaded,
    select: (newData) => newData,
  });

  useEffect(() => {
    if (data) {
      const prefetchPage = async (pageIndex: number) => {
        const cachedData = queryClient.getQueryData<TransactionData[]>([
          "transactions",
          memoizedAddress,
          pageIndex,
          remountKey,
        ]);

        if (!cachedData) {
          await queryClient.prefetchQuery<TransactionData[]>({
            queryKey: ["transactions", memoizedAddress, pageIndex, remountKey],
            queryFn: () => fetchTransactions(pageIndex, pagination.pageSize),
          });
        }
      };

      prefetchPage(pagination.pageIndex + 1);
    }
  }, [
    data,
    pagination.pageIndex,
    pagination.pageSize,
    queryClient,
    fetchTransactions,
    memoizedAddress,
    remountKey,
    loadedPages,
  ]);

  useEffect(() => {
    localStorage.setItem(
      `loadedPages-${address}-${cluster}`,
      JSON.stringify(Array.from(loadedPages)),
    );
  }, [loadedPages, address, cluster]);

  useEffect(() => {
    const storedPages = localStorage.getItem(
      `loadedPages-${address}-${cluster}`,
    );
    if (storedPages) {
      setLoadedPages(new Set(JSON.parse(storedPages)));
    } else {
      setLoadedPages(new Set([0]));
    }
    setRemountKey((prev) => prev + 1);
  }, [address, cluster]);

  const handlePageChange = (newPageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: newPageIndex }));

    // Check if we need to fetch more signatures
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
          <TransactionCard
            data={data}
            pagination={pagination}
            onPageChange={handlePageChange}
            loadedPages={loadedPages}
          />
        ) : (
          <div className="text-center text-muted-foreground">
            No transaction history found for this address.
            <p>
              Debug: Data length: {data?.length}, All signatures:{" "}
              {allSignatures.length}
            </p>
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
