import type { Metadata } from "next";

import LatestCompressionSignatures from "@/components/latest-compression-signatures";

export const metadata: Metadata = {
  title: "Home | Photon - Solana ZK Compression Explorer",
  description: "Photon - Solana ZK Compression Explorer",
};

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Photon - Solana ZK Compression Explorer
        </h1>
      </div>

      <div className="grid gap-4 grid-cols-4">
        <div className="col-span-4">
          <LatestCompressionSignatures />
        </div>
      </div>
    </>
  );
}
