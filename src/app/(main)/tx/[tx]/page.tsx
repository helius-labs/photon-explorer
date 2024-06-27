import type { Metadata } from "next";

import { shorten } from "@/utils/common";

import TransactionDetails from "@/components/transaction/transaction-details";

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
      <div className="grid gap-3">
        <TransactionDetails tx={params.tx} />
      </div>
    </>
  );
}
