import type { Metadata } from "next";

import TransactionDetails from "@/components/transaction/transaction-details";

export const metadata: Metadata = {
  title: "Transaction Details | XRAY Beta - Solana Explorer",
  description: "",
};

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
