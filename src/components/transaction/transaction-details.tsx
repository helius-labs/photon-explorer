"use client";

import { useCluster } from "@/providers/cluster-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import Loading from "@/components/common/loading";
import { Switch } from "@/components/ui/switch";
import { Button } from "../ui/button";

export default function TransactionDetails({ tx }: { tx: string }) {
  // Default RPC transaction data
  const transaction = useGetTransaction(tx);

  // Get parsed transaction data (only for mainnet-beta and devnet)
  const parsed = useGetParsedTransactions([tx]);

  // Compressed transactions (currently only for testnet and localnet)
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
      <div className="mx-[-1rem] md:mx-0">
      <Card className="mx-auto w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-6">
            <div className="text-lg text-muted-foreground">
              Failed to load transaction.
            </div>
            <Button variant="outline" className="mt-4" onClick={handleReturn}>
              Return
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    );

  if (parsed.isLoading || transaction.isLoading || compressed.isLoading)
    return (
      <div className="mx-[-1rem] md:mx-0">
      <Card className="mx-auto w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-10">
            <Loading className="h-10 w-10" />
          </div>
        </CardContent>
      </Card>
      </div>
    );

  let transactionOverview = (
    <div className="mx-[-1rem] md:mx-0">
    <Card className="mx-auto w-full max-w-lg">
      <CardContent className="pt-6">
        <div>Transaction not found</div>
      </CardContent>
    </Card>
    </div>
  );

  if (
    parsed.data &&
    parsed.data.length > 0 &&
    parsed.data[0].description !== ""
  ) {
    // check all the data for txn
    transactionOverview = <TransactionOverviewParsed data={parsed.data[0]} />;
  } else if (transaction.data && compressed.data) {
    transactionOverview = (
      <TransactionOverview
        signature={tx}
        data={transaction.data}
        compressed={compressed.data}
      />
    );
  } else if (transaction.data) {
    transactionOverview = (
      <TransactionOverview
        signature={tx}
        data={transaction.data}
        compressed={null}
      />
    );
  }

  return (
    <>
      {transactionOverview}
      {transaction.data && (
        <div className="mx-auto mb-6 mt-4 flex w-full max-w-lg">
          <Badge className="mr-2" variant="outline">
            Advanced Details
          </Badge>
          <Switch checked={showDetails} onCheckedChange={toggleDetails} />
        </div>
      )}
      {showDetails && transaction.data && (
        <>
          <TransactionInfo tx={tx} data={transaction.data} />
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
