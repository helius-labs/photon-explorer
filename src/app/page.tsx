import type { Metadata } from "next";

import LatestNonVotingSignatures from "@/components/latest-nonvoting-signatures";
import { Search } from "@/components/search";

export const metadata: Metadata = {
  title: "Home | XRAY Beta - Solana Explorer",
  description:
    "The simplest, clearest and most readable explorer for everyday people.",
};

export default function Home() {
  return (
    <>
      <div className="grid pt-40">
        <div className="flex flex-col items-center space-y-10">
          <h1 className="text-9xl font-bold">XRAY</h1>

          <div className="w-[500px]">
            <Search />
          </div>

          <div className="w-[700px] pb-16">
            <LatestNonVotingSignatures />
          </div>
        </div>
      </div>
    </>
  );
}
