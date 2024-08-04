"use client";

import loadingBarAnimation from "@/../public/assets/animations/loadingBar.json";
import { useCluster } from "@/providers/cluster-provider";
import { getParsedTransactions } from "@/server/getParsedTransactions";
import { AccountType, getAccountType } from "@/utils/account";
import { Cluster } from "@/utils/cluster";
import { getSignaturesForAddress, getTransaction } from "@/utils/fetchTxnSigs";
import { XrayTransaction } from "@/utils/parser";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import {
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
  TransactionConfirmationStatus,
  TransactionError,
} from "@solana/web3.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useGetAccountInfo, useGetSignaturesForAddress } from "@/hooks/web3";

import { TransactionCard } from "@/components/account/transaction-card";
import LottieLoader from "@/components/common/lottie-loading";
import { Card, CardContent } from "@/components/ui/card";

import { Button } from "../ui/button";

type TransactionData =
  | ConfirmedSignatureInfo
  | SignatureWithMetadata
  | XrayTransaction
  | ParsedTransactionWithMeta;

type EnhancedTransactionData = TransactionData & {
  transactionDetails?: ParsedTransactionWithMeta | null;
};

interface AccountHistoryProps {
  address: string;
}

export default function AccountHistory({ address }: AccountHistoryProps) {
  const { cluster, endpoint } = useCluster();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [allSignatures, setAllSignatures] = useState<ConfirmedSignatureInfo[]>(
    [],
  );
  const [lastSignature, setLastSignature] = useState<string | undefined>(
    undefined,
  );
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const memoizedAddress = useMemo(() => address, [address]);
  const memoizedCluster = useMemo(() => cluster, [cluster]);

  // Fetch account info and a single signature to determine account type
  const accountInfo = useGetAccountInfo(memoizedAddress);
  const singleSignature = useGetSignaturesForAddress(memoizedAddress, 1);

  const accountType = useMemo(() => {
    if (
      accountInfo.data &&
      accountInfo.data.value !== undefined &&
      singleSignature.data
    ) {
      return getAccountType(accountInfo.data.value, singleSignature.data);
    }
  }, [accountInfo.data, singleSignature.data]);

  const fetchSignatures = useCallback(
    async (limit: number = 50) => {
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
      if (endIndex + pageSize * 3 > allSignatures.length) {
        await fetchSignatures(pageSize * 4); // Fetch 4 pages worth of signatures
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

      // Fetch transaction details
      const transactionDetails = await Promise.all(
        pageSignatures.map((signature) => getTransaction(signature, endpoint)),
      );

      // Combine signatures, parsed transactions, and transaction details
      return pageSignatures.map((signature, index) => {
        let baseData: EnhancedTransactionData;
        if (parsedTransactions && parsedTransactions[index]) {
          baseData = parsedTransactions[index];
        } else {
          baseData = allSignatures[startIndex + index];
        }
        return {
          ...baseData,
          transactionDetails: transactionDetails[index],
        };
      });
    },
    [allSignatures, memoizedCluster, fetchSignatures, endpoint],
  );
  // Effect to load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchSignatures(pagination.pageSize * 4); // Fetch initial 4 pages of signatures
        setIsInitialDataLoaded(true);
      } catch (error) {
        console.error("Error loading initial data:", error);
        // Handle error (e.g., show error message to user)
      }
    };

    if (!isInitialDataLoaded) {
      loadInitialData();
    }
  }, [fetchSignatures, pagination.pageSize, isInitialDataLoaded]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["transactions", memoizedAddress, pagination.pageIndex],
    queryFn: () => fetchTransactions(pagination.pageIndex, pagination.pageSize),
    placeholderData: (previousData) => previousData,
    staleTime: Infinity,
    enabled: isInitialDataLoaded && !!accountType,
  });
  // Prefetch next three pages
  React.useEffect(() => {
    if (data) {
      const prefetchPage = async (pageIndex: number) => {
        await queryClient.prefetchQuery({
          queryKey: ["transactions", memoizedAddress, pageIndex],
          queryFn: () => fetchTransactions(pageIndex, pagination.pageSize),
          staleTime: Infinity,
        });
      };

      // Prefetch next 3 pages
      for (let i = 1; i <= 3; i++) {
        prefetchPage(pagination.pageIndex + i);
      }
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
  console.log("IS LOADING:", isLoading);
  console.log("IS INITIAL DATA LOADED:", isInitialDataLoaded);
  if (!isInitialDataLoaded || accountType === undefined) {
    return (
      <Card className="col-span-12 mx-[-1rem] overflow-hidden md:mx-0">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <LottieLoader
            animationData={loadingBarAnimation}
            className="h-20 w-20"
          />
          <p>Loading initial data...</p>
        </CardContent>
      </Card>
    );
  }

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

  if (isLoading) {
    return (
      <Card className="col-span-12 mx-[-1rem] overflow-hidden md:mx-0">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <LottieLoader
            animationData={loadingBarAnimation}
            className="h-20 w-20"
          />
          <p>Loading transactions...</p>
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
            address={address}
            accountType={accountType}
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
