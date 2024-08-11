"use client";

import React, { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import Script from "next/script";
import TradingViewWidget from "../trading-view/tv-chart-container";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";
import { Card } from "../ui/card";
import { usePythDataFeed } from "@/hooks/usePythDataFeed";

interface TradingChartProps {
  address: string;
}

const AccountCharts: React.FC<TradingChartProps> = ({ address }) => {
  const [isScriptReady, setIsScriptReady] = useState(false);

  // Create a PublicKey object from the address
  const publicKey = address ? new PublicKey(address) : null;

  // Fetch token data based on the mint address
  const { data: tokenData, isLoading, isError } = useGetTokensByMint(
    publicKey?.toBase58() || "",
    !!address
  );

    // Use the custom hook to check for the Pyth data feed
    const { hasPythDataFeed } = usePythDataFeed(address);

  // Handle loading state
  if (isLoading) {
    return;
  }

  // Handle errors in fetching token data
  if (isError || !tokenData || !tokenData.symbol || !hasPythDataFeed) {
    return <div>Error loading token data</div>;
  }

  // Extract the symbol from the token data
  const symbol = tokenData.symbol || "SOL"; // Fallback to 'SOL' if symbol is not available

  return (
    <>
      <Script
        src="/charting_library/charting_library.standalone.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
        defer
      />
      <Script
        src="/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
        defer
      />
      {isScriptReady && (
        <Card className="h-full flex flex-col p-1 sm:p-2 rounded-[16px] border dark:bg-[#012732]">
          <TradingViewWidget address={address} resolution="15" symbol={symbol} />
        </Card>
      )}
    </>
  );
};

export default AccountCharts;