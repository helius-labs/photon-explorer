"use client";

import { useCluster } from "@/providers/cluster-provider";
import { XrayTransaction } from "@/utils/parser";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import {
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
} from "@solana/web3.js";
import { useRouter } from "next/navigation";

import { useGetCompressionSignaturesForAccount } from "@/hooks/compression";

import { TransactionCard } from "@/components/account/transaction-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "../ui/button";

type TransactionData =
  | ConfirmedSignatureInfo
  | SignatureWithMetadata
  | XrayTransaction
  | ParsedTransactionWithMeta;

export default function CompressionHistory({ address }: { address: string }) {
  const { cluster } = useCluster();
  const router = useRouter();

  const signatures = useGetCompressionSignaturesForAccount(address);

  const handleReturn = () => {
    router.push(`/?cluster=${cluster}`);
  };

  if (signatures.isError)
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

  if (signatures.isLoading)
    return (
      <Card className="col-span-12">
        <CardContent className="flex flex-col gap-4 pt-6">
          {[0, 1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );

  const data: TransactionData[] = signatures.data?.length
    ? signatures.data
    : [];

  return (
    <Card className="col-span-12 mb-10">
      <CardContent className="pt-6">
        <TransactionCard data={data} />
      </CardContent>
    </Card>
  );
}
