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

export default function AccountHistory({ address }: AccountHistoryProps) {
  const { cluster, endpoint } = useCluster();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [allSignatures, setAllSignatures] = useState<TransactionData[]>([]);
  const [lastSignature, setLastSignature] = useState<string | undefined>(
    undefined,
  );
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0]));

  const memoizedAddress = useMemo(() => address, [address]);
  const memoizedCluster = useMemo(() => cluster, [cluster]);

  // Reset state and invalidate cache when endpoint changes
  useEffect(() => {
    setAllSignatures([]);
    setLastSignature(undefined);
    setIsInitialDataLoaded(false);
    setLoadedPages(new Set([0]));
    setPagination({ pageIndex: 0, pageSize: 10 });

    // Invalidate and refetch the query
    queryClient.invalidateQueries({
      queryKey: ["transactions", memoizedAddress],
    });
  }, [endpoint, memoizedAddress, queryClient]);

  const fetchSignatures = useCallback(
    async (limit: number = 200): Promise<TransactionData[]> => {
      try {
        console.log(
          `Fetching new signatures. Limit: ${limit}, Last signature: ${lastSignature}`,
        );
        const newSignatures = await getSignaturesForAddress(
          memoizedAddress,
          limit,
          endpoint,
          lastSignature,
        );
        console.log(
          `Fetched ${newSignatures.length} new signatures:`,
          newSignatures,
        );
        setAllSignatures((prevSignatures) => [
          ...prevSignatures,
          ...newSignatures,
        ]);
        if (newSignatures.length > 0) {
          const newLastSignature =
            newSignatures[newSignatures.length - 1].signature;
          console.log(`Setting new last signature: ${newLastSignature}`);
          setLastSignature(newLastSignature);
        }
        return newSignatures;
      } catch (error) {
        console.error("Error fetching signatures:", error);
        throw error;
      }
    },
    [memoizedAddress, endpoint, lastSignature],
  );

  const fetchTransactions = useCallback(
    async (pageIndex: number, pageSize: number): Promise<TransactionData[]> => {
      const startIndex = pageIndex * pageSize;
      const endIndex = startIndex + pageSize;

      if (endIndex + pageSize * 2 > allSignatures.length) {
        console.log(
          `Fetching more signatures. Current count: ${allSignatures.length}, Required: ${endIndex + pageSize * 2}`,
        );
        await fetchSignatures(200);
      }

      const pageSignatures = allSignatures
        .slice(startIndex, endIndex)
        .map((sig) => {
          if ("signature" in sig) {
            return sig.signature;
          } else if (
            "transaction" in sig &&
            sig.transaction.signatures.length > 0
          ) {
            return sig.transaction.signatures[0];
          }
          return ""; // or handle the case where there is no signature
        });

      console.log(
        `Fetching transactions for page ${pageIndex}. Signatures:`,
        pageSignatures,
      );

      let parsedTransactions: TransactionData[] | null = null;
      if (
        memoizedCluster === Cluster.MainnetBeta ||
        memoizedCluster === Cluster.Devnet
      ) {
        parsedTransactions = await getParsedTransactions(
          pageSignatures,
          memoizedCluster,
        );
        console.log(
          `Parsed ${parsedTransactions?.length} transactions for page ${pageIndex}`,
        );
      }

      setLoadedPages((prevLoadedPages) =>
        new Set(prevLoadedPages).add(pageIndex),
      );

      return pageSignatures.map((signature, index) => {
        if (parsedTransactions && parsedTransactions[index]) {
          return parsedTransactions[index];
        } else {
          return allSignatures[startIndex + index];
        }
      });
    },
    [allSignatures, memoizedCluster, fetchSignatures],
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      console.log("Fetching initial data");
      await fetchSignatures(200);
      setIsInitialDataLoaded(true);
      console.log("Initial data loaded");
    };
    fetchInitialData();
  }, [fetchSignatures, pagination.pageSize]);

  const { data, isLoading, isError } = useQuery<TransactionData[]>({
    queryKey: ["transactions", memoizedAddress, pagination.pageIndex, endpoint],
    queryFn: () => fetchTransactions(pagination.pageIndex, pagination.pageSize),
    placeholderData: (previousData) => previousData,
    staleTime: Infinity,
    enabled: isInitialDataLoaded,
  });

  React.useEffect(() => {
    if (data) {
      const prefetchPage = async (pageIndex: number) => {
        console.log(`Prefetching page ${pageIndex}`);
        await queryClient.prefetchQuery<TransactionData[]>({
          queryKey: ["transactions", memoizedAddress, pageIndex],
          queryFn: () => fetchTransactions(pageIndex, pagination.pageSize),
          staleTime: Infinity,
        });
      };

      prefetchPage(pagination.pageIndex + 1);
      prefetchPage(pagination.pageIndex + 2);
    }
  }, [
    data,
    pagination.pageIndex,
    pagination.pageSize,
    queryClient,
    fetchTransactions,
    memoizedAddress,
  ]);

  const handlePageChange = (newPageIndex: number) => {
    console.log(`Changing to page ${newPageIndex}`);
    setPagination((prev) => ({ ...prev, pageIndex: newPageIndex }));
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
    const skeletonRows = Array.from({ length: pagination.pageSize }, (_, i) => (
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
            <Skeleton className="h-6 w-6 rounded-full" />{" "}
            {/* Circle Skeleton */}
            <Skeleton className="h-4 w-36 md:w-28" /> {/* Info Text Skeleton */}
          </div>
          {/* Signature Section Skeleton */}
          <div className="flex flex-1 items-center justify-center">
            <Skeleton className="h-4 w-32 md:w-24" /> {/* Signature Skeleton */}
          </div>
        </div>
        {i < pagination.pageSize - 1 && (
          <div className="border-bg-popover border-t" />
        )}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
