"use client";

import { useCluster } from "@/providers/cluster-provider";
import { useRouter } from "next/navigation";

import { useGetTransactionWithCompressionInfo } from "@/hooks/compression";
import { useGetTransaction } from "@/hooks/web3";

import TransactionAccountBalances from "@/components/transaction/transaction-account-balances";
import TransactionCompressionAccountBalances from "@/components/transaction/transaction-compression-account-balances";
import TransactionCompressionTokenBalances from "@/components/transaction/transaction-compression-token-balances";
import TransactionInstructionLogs from "@/components/transaction/transaction-instruction-logs";
import TransactionInstructions from "@/components/transaction/transaction-instructions";
import TransactionOverview from "@/components/transaction/transaction-overview";
import TransactionTokenBalances from "@/components/transaction/transaction-token-balances";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loading from "@/components/common/loading";

export default function TransactionDetails({ tx }: { tx: string }) {
  // Default RPC transaction data
  const transaction = useGetTransaction(tx);

  // Compressed transactions (currently only for testnet and localnet)
  const compressed = useGetTransactionWithCompressionInfo(tx);

  const { cluster } = useCluster();
  const router = useRouter();

  const handleReturn = () => {
    router.push(`/?cluster=${cluster}`);
  };


  if (transaction.isError || compressed.isError)
    return (
      <div className="mx-[-1rem] md:mx-0">
        <Card className="mx-auto w-full">
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

  if (transaction.isLoading || compressed.isLoading)
    return (
      <div className="mx-[-1rem] md:mx-0">
        <Card className="mx-auto flex items-center justify-center h-64">
          <Loading />
        </Card>
      </div>
    );

  let transactionOverview = (
    <div className="mx-[-1rem] md:mx-0">
      <Card className="mx-auto w-full">
        <CardContent className="pt-6">
          <div>Transaction not found</div>
        </CardContent>
      </Card>
    </div>
  );

  if (transaction.data && compressed.data) {
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
        <>
          <TransactionTokenBalances data={transaction.data} />
          <TransactionCompressionTokenBalances tx={tx} />
          <TransactionAccountBalances data={transaction.data} />
          <TransactionCompressionAccountBalances tx={tx} />
          <TransactionInstructions data={transaction.data} />
          <TransactionInstructionLogs data={transaction.data} />
        </>
      )}
    </>
  );
}
