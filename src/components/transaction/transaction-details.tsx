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
import { Switch } from "@/components/ui/switch";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

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
          <Card className="mx-auto max-w-lg w-full p-4 md:p-6">
            <CardContent className="p-6 md:p-8">
              {/* Row 1: Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
                <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-0">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-5 w-20 md:w-28" />
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <Skeleton className="h-4 w-20 md:w-24 mb-2" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>

              {/* Separator between Row 1 and Row 2 */}
              <div className="border-t border-foreground-muted my-4 md:my-6"></div>

              {/* Row 2: Description */}
              <Skeleton className="h-4 w-36 md:w-44 mb-4 md:mb-6" />

              {/* Separator between Row 2 and Row 3 */}
              <div className="border-t border-foreground-muted my-4 md:my-6"></div>

              {/* Row 3: Account */}
              <div className="flex flex-col md:flex-row justify-start items-start md:items-center mb-4 md:mb-6 space-y-2 md:space-y-0 md:space-x-6">
                <Skeleton className="h-4 w-20 md:w-24" />
                <Skeleton className="h-4 w-32 md:w-40" />
              </div>

              {/* Row 4: Sent */}
              <div className="flex flex-col md:flex-row justify-start items-start md:items-center mb-4 md:mb-6 space-y-2 md:space-y-0 md:space-x-6">
                <Skeleton className="h-4 w-16 md:w-20" />
                <Skeleton className="h-4 w-20 md:w-24" />
              </div>

              {/* Row 4: To */}
              <div className="flex flex-col md:flex-row justify-start items-start md:items-center mb-4 md:mb-6 space-y-2 md:space-y-0 md:space-x-6">
                <Skeleton className="h-4 w-16 md:w-20" />
                <Skeleton className="h-4 w-20 md:w-24" />
              </div>              

              {/* Row 5: Program */}
              <div className="flex flex-col md:flex-row justify-start items-start md:items-center mb-4 md:mb-6 space-y-2 md:space-y-0 md:space-x-6">
                <Skeleton className="h-4 w-24 md:w-28" />
                <Skeleton className="h-4 w-24 md:w-28" />
              </div>

              {/* Separator between Row 5 and Row 6 */}
              <div className="border-t border-foreground-muted my-4 md:my-6"></div>

              {/* Row 6: Signature */}
              <div className="flex flex-col md:flex-row justify-start items-start md:items-center space-y-2 md:space-y-0 md:space-x-6">
                <Skeleton className="h-4 w-24 md:w-28" />
                <Skeleton className="h-4 w-32 md:w-40" />
              </div>
            </CardContent>
          </Card>
          {/* Advanced Details Section */}
          <div className="mx-auto mb-6 mt-6 flex flex-col md:flex-row justify-center md:justify-start items-center w-full max-w-lg space-y-2 md:space-y-0 md:space-x-4">
            <Skeleton className="h-6 w-28 md:w-36 rounded-full" />
            <Skeleton className="h-6 w-12 md:w-12 rounded-full" />
          </div>
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
        <div className="mx-auto mb-6 mt-4 flex items-center justify-center w-full max-w-lg">
          <Badge className="mr-2 cursor-pointer" variant="outline" onClick={toggleDetails}>
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
