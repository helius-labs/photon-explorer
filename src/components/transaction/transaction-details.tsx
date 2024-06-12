"use client";

import { useGetTransaction } from "@/hooks/web3";

import Loading from "@/components/common/loading";
import TransactionAccountKeys from "@/components/transaction/transaction-account-keys";
import TransactionCompressionInfo from "@/components/transaction/transaction-compression-info";
import TransactionInstructionLogs from "@/components/transaction/transaction-instruction-logs";
import TransactionInstructions from "@/components/transaction/transaction-instructions";
import TransactionOverview from "@/components/transaction/transaction-overview";
import TransactionTokenBalances from "@/components/transaction/transaction-token-balances";
import { Card, CardContent } from "@/components/ui/card";

export default function TransactionDetails({ tx }: { tx: string }) {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetTransaction(tx);

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
  if (!data)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div>Transaction not found</div>
        </CardContent>
      </Card>
    );

  return (
    <>
      <TransactionOverview
        data={data}
        refetch={refetch}
        isFetching={isFetching}
      />
      <TransactionCompressionInfo tx={tx} />
      <TransactionAccountKeys data={data} />
      <TransactionTokenBalances data={data} />
      <TransactionInstructions data={data} />
      <TransactionInstructionLogs data={data} />
    </>
  );
}
