"use client";

import { useState } from "react";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import { useGetParsedTransactions } from "@/hooks/parser";
import { useGetTransaction } from "@/hooks/web3";

import Loading from "@/components/common/loading";
import TransactionAccountKeys from "@/components/transaction/transaction-account-keys";
import TransactionCompressionInfo from "@/components/transaction/transaction-compression-info";
import TransactionInstructionLogs from "@/components/transaction/transaction-instruction-logs";
import TransactionInstructions from "@/components/transaction/transaction-instructions";
import TransactionOverview from "@/components/transaction/transaction-overview";
import TransactionOverviewParsed from "@/components/transaction/transaction-overview-parsed";
import TransactionTokenBalances from "@/components/transaction/transaction-token-balances";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function TransactionDetails({ tx }: { tx: string }) {
  const transaction = useGetTransaction(tx);

  // Only for mainnet-beta and devnet
  const parsed = useGetParsedTransactions([tx]);

  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => setShowDetails((prev) => !prev);

  if (parsed.isError || transaction.isError)
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div>Failed to load</div>
        </CardContent>
      </Card>
    );
  if (parsed.isLoading || transaction.isLoading)
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <Loading />
        </CardContent>
      </Card>
    );

  return (
    <>
      {parsed.data && parsed.data.length > 0 ? (
        <TransactionOverviewParsed data={parsed.data[0]} />
      ) : transaction.data ? (
        <TransactionOverview data={transaction.data} />
      ) : (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div>Transaction not found</div>
          </CardContent>
        </Card>
      )}
      {transaction.data && (
        <div className="flex w-full max-w-md mx-auto mt-4 mb-6">
          <Badge className="mr-2" variant="outline">
            Advanced Details
          </Badge>
          <Switch checked={showDetails} onCheckedChange={toggleDetails} />
        </div>
      )}
      {showDetails && transaction.data && (
        <>
          <TransactionCompressionInfo tx={tx} />
          <TransactionAccountKeys data={transaction.data} />
          <TransactionTokenBalances data={transaction.data} />
          <TransactionInstructions data={transaction.data} />
          <TransactionInstructionLogs data={transaction.data} />
        </>
      )}
    </>
  );
}
