import type { Metadata } from "next";

import TransactionDetails from "@/components/transaction/transaction-details";
import { shorten } from "@/lib/utils";

type Props = Readonly<{
  params: {
    tx: string;
  };
}>;

// or Dynamic metadata
export async function generateMetadata({ params }: Props) {
  return {
    title: `Transaction ${shorten(params.tx)} - XRAY`,
    description: `Transaction overview and details for transaction ${params.tx}`,
  };
}

export default function Page({ params }: { params: { tx: string } }) {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Transaction</h1>
      </div>

      <div className="grid gap-3">
        <TransactionDetails tx={params.tx} />
      </div>
    </>
  );
}
