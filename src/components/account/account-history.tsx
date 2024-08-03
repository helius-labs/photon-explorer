"use client";

import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { XrayTransaction } from "@/utils/parser";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import {
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
} from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useGetParsedTransactions } from "@/hooks/parser";
import { useGetSignaturesForAddress } from "@/hooks/web3";

import { TransactionCard } from "@/components/account/transaction-card";
import LottieLoader from "@/components/common/lottie-loading";
import loadingBarAnimation from '@/../public/assets/animations/loadingBar.json';
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
  const { cluster } = useCluster();
  const router = useRouter();

  const memoizedAddress = useMemo(() => address, [address]);
  const memoizedCluster = useMemo(() => cluster, [cluster]);

  // this is used to get all the signatures for an account
  const signatures = useGetSignaturesForAddress(memoizedAddress, 200);

  // this then parses those transactions
  const parsedTransactions = useGetParsedTransactions(
    // only parse the first 90 transactions
    (signatures.data?.map((sig) => sig.signature) || []).slice(0, 50),
    memoizedCluster === Cluster.MainnetBeta ||
      memoizedCluster === Cluster.Devnet,
  );

  const handleReturn = () => {
    router.push(`/?cluster=${memoizedCluster}`);
  };

  if (signatures.isError || parsedTransactions.isError) {
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

  if (signatures.isLoading || parsedTransactions.isLoading) {
    return (
      <Card className="col-span-12 mx-[-1rem] overflow-hidden md:mx-0">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <LottieLoader animationData={loadingBarAnimation} className="h-20 w-20" />
        </CardContent>
      </Card>
    );
  }

  // this is the flow to add transactions to the table. If a txn is parsed, add it to the table, otherwise add the signature
  let result: TransactionData[] = [];
  let parsedIndex = 0;
  let signatureIndex = 0;

  while (signatureIndex < (signatures.data ?? []).length) {
    if (
      parsedTransactions.data &&
      parsedTransactions.data[parsedIndex] &&
      parsedTransactions.data[parsedIndex].signature ===
        (signatures.data ?? [])[signatureIndex]?.signature
    ) {
      result.push(parsedTransactions.data[parsedIndex]);
      parsedIndex++;
    } else {
      if (signatures.data) {
        result.push(signatures.data[signatureIndex]);
      }
    }
    signatureIndex++;
  }

  const data: TransactionData[] = result;

  return (
    <Card className="col-span-12 mx-[-1rem] mb-10 overflow-hidden md:mx-0">
      <CardContent className="pt-6">
        {data.length > 0 ? (
          <TransactionCard data={data} />
        ) : (
          <div className="text-center text-muted-foreground">
            No transaction history found for this address.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
