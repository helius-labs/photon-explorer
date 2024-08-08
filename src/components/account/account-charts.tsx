"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Script from "next/script";
import { ChartingLibraryWidgetOptions, ResolutionString } from "../../../public/charting_library/charting_library";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";
import { Token } from "@/types/token";

const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
  interval: "15" as ResolutionString,
  library_path: "/charting_library/",
  locale: "en",
  charts_storage_url: "https://saveload.tradingview.com",
  charts_storage_api_version: "1.1",
  client_id: "tradingview.com",
  user_id: "public_user_id",
  fullscreen: false,
  autosize: true,
  custom_css_url: '/tradingview.css',
};

const TVChartContainer = dynamic(
  () => import("../../components/trading-view/tv-chart-container").then((mod) => mod.TVChartContainer),
  { ssr: false }
);

interface TradingChartProps {
  address: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ address }) => {
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [token, setToken] = useState<Token | null>(null);
  const { data: tokenData, isLoading, isError } = useGetTokensByMint(address);

  useEffect(() => {
    if (!isLoading && !isError && tokenData) {
      setToken(tokenData);
    }
  }, [isLoading, isError, tokenData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !token) {
    return <div>Error loading token data</div>;
  }

  return (
    <>
      <Script
        src="/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
      />
      {isScriptReady && (
        <div className="h-full flex flex-col p-1 sm:p-2 cardShadowBor rounded-b-[16px] border-l border-r border-b dark:bg-[#012732]">
          <TVChartContainer
            token={token}
            locale="en"
            charts_storage_url="https://saveload.tradingview.com"
            charts_storage_api_version="1.1"
            client_id="tradingview.com"
            user_id="public_user_id"
            fullscreen={false}
            autosize={true}
          />
        </div>
      )}
    </>
  );
};

export default TradingChart;
