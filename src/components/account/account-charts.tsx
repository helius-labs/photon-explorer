"use client";

import React from "react";
import { PublicKey } from "@solana/web3.js";
import TradingViewWidget from "../trading-view/tv-chart-container";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";
import { Card } from "../ui/card";

interface TradingChartProps {
  address: string;
}

const AccountCharts: React.FC<TradingChartProps> = ({ address }) => {

  // Even if the address might be invalid, we still call the hook unconditionally
  const publicKey = address ? new PublicKey(address) : null;

  // Call the hook, enabled only if a valid address is provided
  const { data: tokenData, isLoading, isError } = useGetTokensByMint(
    publicKey?.toBase58() || "",
    !!address
  );

  // Handle loading state
  if (isLoading) {
    return;
  }

  // Handle errors in fetching token data
  if (isError || !tokenData) {
    return <div>Error loading token data</div>;
  }

  return (
    <Card className="h-full flex flex-col p-1 sm:p-2 rounded-[16px] border">
      {/* Pass the resolved symbol to the TradingViewWidget */}
      <TradingViewWidget resolution="15" symbol={tokenData.symbol || ""} />
    </Card>
  );
};

export default AccountCharts;
