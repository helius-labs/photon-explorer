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
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

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
  const [allSignatures, setAllSignatures] = useState<ConfirmedSignatureInfo[]>(
    [],
  );
  const [lastSignature, setLastSignature] = useState<string | undefined>(
    undefined,
  );
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0]));

  const memoizedAddress = useMemo(() => address, [address]);
  const memoizedCluster = useMemo(() => cluster, [cluster]);

  const fetchSignatures = useCallback(
    async (limit: number = 20) => {
      try {
        const newSignatures = await getSignaturesForAddress(
          memoizedAddress,
          limit,
          endpoint,
          lastSignature,
        );
        setAllSignatures((prevSignatures) => [
          ...prevSignatures,
          ...newSignatures,
        ]);
        if (newSignatures.length > 0) {
          setLastSignature(newSignatures[newSignatures.length - 1].signature);
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
    async (pageIndex: number, pageSize: number) => {
      const startIndex = pageIndex * pageSize;
      const endIndex = startIndex + pageSize;

      // If we're close to the end of our current signatures, fetch more
      if (endIndex + pageSize > allSignatures.length) {
        await fetchSignatures(pageSize * 2); // Fetch 2 pages worth of signatures
      }

      const pageSignatures = allSignatures
        .slice(startIndex, endIndex)
        .map((sig) => sig.signature);

      let parsedTransactions = null;
      if (
        memoizedCluster === Cluster.MainnetBeta ||
        memoizedCluster === Cluster.Devnet
      ) {
        parsedTransactions = await getParsedTransactions(
          pageSignatures,
          memoizedCluster,
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

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchSignatures(pagination.pageSize * 2); // Fetch 2 pages worth of signatures initially
      setIsInitialDataLoaded(true);
    };
    fetchInitialData();
  }, [fetchSignatures, pagination.pageSize]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["transactions", memoizedAddress, pagination.pageIndex],
    queryFn: () => fetchTransactions(pagination.pageIndex, pagination.pageSize),
    placeholderData: (previousData) => previousData,
    staleTime: Infinity,
    enabled: isInitialDataLoaded,
  });

  // Prefetch next page
  React.useEffect(() => {
    if (data) {
      const prefetchPage = async (pageIndex: number) => {
        await queryClient.prefetchQuery({
          queryKey: ["transactions", memoizedAddress, pageIndex],
          queryFn: () => fetchTransactions(pageIndex, pagination.pageSize),
          staleTime: Infinity,
        });
      };

      // Prefetch only the next page
      prefetchPage(pagination.pageIndex + 1);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6">
          <div className="flex items-center space-x-2 mb-4 md:mb-0"> 
            <Skeleton className="h-7 w-7 rounded-[8px]" /> 
            <div className="flex flex-col space-y-2"> 
              <Skeleton className="h-5 w-32" /> {/* Title Skeleton */}
              <Skeleton className="h-3 w-24" /> {/* Timestamp Skeleton */}
            </div>
          </div>
          <div className="flex flex-1 justify-between items-center">
            <Skeleton className="h-4 w-44 mx-auto" /> {/* Centered Info Skeleton */}
            <Skeleton className="hidden md:flex h-4 w-24" /> {/* Signature Skeleton */}
          </div>
        </div>
        {i < pagination.pageSize - 1 && (
          <div className="border-t border-bg-popover" />
        )}
      </div>
    ));
  
    return (
      <Card className="col-span-12 mx-[-1rem] overflow-hidden md:mx-0">
        <CardContent className="pt-4">
          <div className="hidden md:flex items-center p-6 border-b">
            <div className="flex-1 flex justify-start">
              <Skeleton className="md:ml-6 h-3 w-16" /> {/* Type Header */}
            </div>
            <div className="flex-1 flex justify-center">
              <Skeleton className="h-3 w-16" /> {/* Centered Info Header */}
            </div>
            <div className="flex-1 flex justify-center">
              <Skeleton className="h-3 w-32" /> {/* Signature Header */}
            </div>
          </div>
          {/* Data Row Skeletons */}
          <div className="flex flex-col space-y-4">
            {skeletonRows}
          </div>
          {/* Pagination Skeleton */}
          <div className="flex justify-center items-center mt-2">
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
