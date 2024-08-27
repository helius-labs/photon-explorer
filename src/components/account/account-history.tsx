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

const INITIAL_PAGE_SIZE = 10;
const SIGNATURE_FETCH_LIMIT = 200;

function LoadingSkeleton({ pageSize }: { pageSize: number }) {
  return (
    <Card className="col-span-12 mx-[-1rem] mb-10 overflow-hidden md:mx-0">
      <CardContent className="pt-6">
        {Array.from({ length: pageSize }).map((_, index) => (
          <Skeleton key={index} className="mb-4 h-20 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

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

  const memoizedAddress = useMemo(() => address, [address]);
  const memoizedCluster = useMemo(() => cluster, [cluster]);

  const fetchSignatures = useCallback(async () => {
    try {
      const newSignatures = await getSignaturesForAddress(
        memoizedAddress,
        SIGNATURE_FETCH_LIMIT,
        endpoint,
        lastSignature,
      );
      setAllSignatures((prev) => [...prev, ...newSignatures]);
      if (newSignatures.length > 0) {
        setLastSignature(newSignatures[newSignatures.length - 1].signature);
      }
      return newSignatures;
    } catch (error) {
      console.error("Error fetching signatures:", error);
      throw error;
    }
  }, [memoizedAddress, endpoint, lastSignature]);

  const fetchTransactions = useCallback(
    async (pageIndex: number, pageSize: number) => {
      const startIndex = pageIndex * pageSize;
      const endIndex = startIndex + pageSize;

      if (endIndex + pageSize * 2 > allSignatures.length) {
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

      return pageSignatures.map((signature, index) =>
        parsedTransactions && parsedTransactions[index]
          ? parsedTransactions[index]
          : allSignatures[startIndex + index],
      );
    },
    [allSignatures, memoizedCluster, fetchSignatures],
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchSignatures();
      setIsInitialDataLoaded(true);
    };
    fetchInitialData();
  }, [fetchSignatures]);

  const { data, isLoading, isError } = useQuery<TransactionData[]>({
    queryKey: ["transactions", memoizedAddress, pagination.pageIndex],
    queryFn: () => fetchTransactions(pagination.pageIndex, pagination.pageSize),
    placeholderData: (previousData) => previousData,
    staleTime: Infinity,
    enabled: isInitialDataLoaded,
  });

  useEffect(() => {
    if (data) {
      const prefetchPage = async (pageIndex: number) => {
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ... (LoadingSkeleton component implementation)
