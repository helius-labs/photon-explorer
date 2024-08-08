"use client";

import loadingBarAnimation from "@/../public/assets/animations/loadingBar.json";
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
import LottieLoader from "@/components/common/lottie-loading";
import { Card, CardContent } from "@/components/ui/card";

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
    async (limit: number = 200) => {
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
      if (endIndex + pageSize * 2 > allSignatures.length) {
        await fetchSignatures(200); // Fetch  signatures
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
      await fetchSignatures(200); // Fetch 2 pages worth of signatures initially
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

      // Prefetch pages
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
    return (
      <Card className="col-span-12 mx-[-1rem] overflow-hidden md:mx-0">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <LottieLoader
            animationData={loadingBarAnimation}
            className="h-20 w-20"
          />
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
