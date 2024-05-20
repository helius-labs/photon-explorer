import type { Metadata } from "next";

import LatestCompressionSignatures from "@/components/latest-compression-signatures";
import LatestNonVotingSignatures from "@/components/latest-nonvoting-signatures";
import LatestTransactions from "@/components/latest-transactions";

export const metadata: Metadata = {
  title: "Home | Photon - Solana Explorer",
  description: "Photon - Solana Explorer",
};

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Photon - Solana Explorer
        </h1>
      </div>

      <div className="grid gap-4 grid-cols-4">
        <div className="col-span-4">
          <LatestNonVotingSignatures />
        </div>
      </div>
    </>
  );
}
