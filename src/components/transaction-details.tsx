"use client";

import { useGetTransaction } from "@/lib/web3";
import { Card, CardContent } from "@/components/ui/card";
import TransactionOverview from "@/components/transaction-overview";
import TransactionAccountKeys from "@/components/transaction-account-keys";
import TransactionInstructions from "@/components/transaction-instructions";

export default function TransactionDetails({ tx }: { tx: string }) {
  const { transaction, isLoading, isError } = useGetTransaction(tx);

  if (isError)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div>failed to load</div>
        </CardContent>
      </Card>
    );
  if (isLoading)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div>loading...</div>
        </CardContent>
      </Card>
    );
  if (!transaction)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div>transaction not found</div>
        </CardContent>
      </Card>
    );

  return (
    <>
      <TransactionOverview transaction={transaction} />
      <TransactionAccountKeys transaction={transaction} />
      <TransactionInstructions transaction={transaction} />
    </>
  );
}
