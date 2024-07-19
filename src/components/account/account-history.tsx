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

import { useGetParsedTransactions } from "@/hooks/parser";
import { useGetSignaturesForAddress } from "@/hooks/web3";

import { TransactionCard } from "@/components/account/transaction-card";
import Loading from "@/components/common/loading";
import LoadingBadge from "@/components/common/loading-badge";
import { Card, CardContent } from "@/components/ui/card";

import { Button } from "../ui/button";

type TransactionData =
  | ConfirmedSignatureInfo
  | SignatureWithMetadata
  | XrayTransaction
  | ParsedTransactionWithMeta;

export default function AccountHistory({ address }: { address: string }) {
  const { cluster } = useCluster();
  const router = useRouter();

  // this is used to get all the signatures for an account
  const signatures = useGetSignaturesForAddress(address, 500);
  // this then parses those transactions
  const parsedTransactions = useGetParsedTransactions(
    //only parse the first 90 transactions
    (signatures.data?.map((sig) => sig.signature) || []).slice(0, 90),
    cluster === Cluster.MainnetBeta || cluster === Cluster.Devnet,
  );

  const handleReturn = () => {
    router.push(`/?cluster=${cluster}`);
  };

  if (signatures.isError || parsedTransactions.isError)
    return (
      <Card className="col-span-12">
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

  if (signatures.isLoading || parsedTransactions.isLoading)
    return (
      <Card className="col-span-12">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Loading className="h-12 w-12" />
          <LoadingBadge text="Loading History" />
        </CardContent>
      </Card>
    );

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
    <Card className="col-span-12 mb-10">
      <CardContent className="pt-6">
        <TransactionCard data={data} />
      </CardContent>
    </Card>
  );
}
