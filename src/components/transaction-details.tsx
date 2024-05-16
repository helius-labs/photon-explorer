"use client";

import { useGetTransaction } from "@/hooks/web3";

import Loading from "@/components/loading";
import TransactionAccountKeys from "@/components/transaction-account-keys";
import TransactionCompressionInfo from "@/components/transaction-compression-info";
import TransactionInstructionLogs from "@/components/transaction-instruction-logs";
import TransactionInstructions from "@/components/transaction-instructions";
import TransactionOverview from "@/components/transaction-overview";
import { Card, CardContent } from "@/components/ui/card";

export default function TransactionDetails({ tx }: { tx: string }) {
  const { transaction, isLoading, isError } = useGetTransaction(tx);

  if (isError)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div>Failed to load</div>
        </CardContent>
      </Card>
    );
  if (isLoading)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Loading />
        </CardContent>
      </Card>
    );
  if (!transaction)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div>Transaction not found</div>
        </CardContent>
      </Card>
    );

  return (
    <>
      <TransactionOverview transaction={transaction} />
      <TransactionCompressionInfo tx={tx} />
      <TransactionAccountKeys transaction={transaction} />
      <TransactionInstructions transaction={transaction} />
      <TransactionInstructionLogs transaction={transaction} />
    </>
  );
}
