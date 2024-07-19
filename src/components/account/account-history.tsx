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
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/common/loading";
import LoadingBadge from "@/components/common/loading-badge";
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

  // Get all the signatures for an account
  const signatures = useGetSignaturesForAddress(address);
  // Parse those transactions
  const parsedTransactions = useGetParsedTransactions(
    signatures.data?.map((sig) => sig.signature) || [],
    cluster === Cluster.MainnetBeta || cluster === Cluster.Devnet,
  );

  const handleReturn = () => {
    router.push(`/?cluster=${cluster}`);
  };

  if (signatures.isError || parsedTransactions.isError) {
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
  }

  if (signatures.isLoading || parsedTransactions.isLoading) {
    return (
      <Card className="col-span-12">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Loading className="h-12 w-12" />
          <LoadingBadge text="Loading History" />
        </CardContent>
      </Card>
    );
  }

  const data: TransactionData[] = parsedTransactions.data?.length
    ? parsedTransactions.data
    : signatures.data?.length
    ? signatures.data
    : [];

  return (
    <Card className="col-span-12 mb-10">
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
