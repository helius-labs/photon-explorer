"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetTransactionWithCompressionInfo } from "@/hooks/compression";
import { useGetParsedTransactions } from "@/hooks/parser";
import { useGetTransaction } from "@/hooks/web3";

import TransactionAccountBalances from "@/components/transaction/transaction-account-balances";
import TransactionCompressionAccountBalances from "@/components/transaction/transaction-compression-account-balances";
import TransactionCompressionTokenBalances from "@/components/transaction/transaction-compression-token-balances";
import TransactionInfo from "@/components/transaction/transaction-info";
import TransactionInstructionLogs from "@/components/transaction/transaction-instruction-logs";
import TransactionInstructions from "@/components/transaction/transaction-instructions";
import TransactionOverview from "@/components/transaction/transaction-overview";
import TransactionOverviewParsed from "@/components/transaction/transaction-overview-parsed";
import TransactionTokenBalances from "@/components/transaction/transaction-token-balances";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "../ui/button";
import { useCluster } from "@/providers/cluster-provider";

export default function TransactionDetails({ tx }: { tx: string }) {
  // Default RPC transaction data
  const transaction = useGetTransaction(tx);
  
  // Get parsed transaction data (only for mainnet-beta and devnet)
  const parsed = useGetParsedTransactions([tx]);

  // Compressed transactions
  const compressed = useGetTransactionWithCompressionInfo(tx);

  const { cluster } = useCluster();
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  const toggleDetails = () => setShowDetails((prev) => !prev);

  const handleReturn = () => {
    router.push(`/?cluster=${cluster}`);
  };

  if (parsed.isError || transaction.isError || compressed.isError)
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-6">
            <div className="text-muted-foreground text-lg">Failed to load transaction.</div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleReturn}
            >
              Return
            </Button>          
          </div>
        </CardContent>
      </Card>
    );
  if (parsed.isLoading || transaction.isLoading || compressed.isLoading)
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );

  let transactionOverview = (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="pt-6">
        <div>Transaction not found</div>
      </CardContent>
    </Card>
  );

  if (parsed.data && parsed.data.length > 0) {
    transactionOverview = <TransactionOverviewParsed data={parsed.data[0]} />;
  } else if (transaction.data && compressed.data) {
    transactionOverview = (
      <TransactionOverview
        signature={tx}
        data={transaction.data}
        compressed={compressed.data}
      />
    );
  }

  return (
    <>
      {transactionOverview}
      {transaction.data && (
        <div className="flex w-full max-w-lg mx-auto mt-4 mb-6">
          <Badge className="mr-2" variant="outline">
            Advanced Details
          </Badge>
          <Switch checked={showDetails} onCheckedChange={toggleDetails} />
        </div>
      )}
      {showDetails && transaction.data && (
        <>
          <TransactionInfo data={transaction.data} />
          <TransactionAccountBalances data={transaction.data} />
          <TransactionCompressionAccountBalances tx={tx} />
          <TransactionTokenBalances data={transaction.data} />
          <TransactionCompressionTokenBalances tx={tx} />
          <TransactionInstructions data={transaction.data} />
          <TransactionInstructionLogs data={transaction.data} />
        </>
      )}
    </>
  );
}
