"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";
import { usePythDataFeed } from "@/hooks/usePythDataFeed";
import datafeed from "@/utils/datafeed"; // Assuming this is where your datafeed is located

interface ChartData {
  time: number;
  price: number;
}

interface TokenLineChartProps {
  address: string;
}

export function TokenLineChart({ address }: TokenLineChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ensure address is available before proceeding
  const publicKey = address ? new PublicKey(address) : null;

  // Fetch token data based on the mint address
  const { data: tokenData, isLoading: tokenLoading, isError: tokenError } = useGetTokensByMint(
    publicKey?.toBase58() || "",
    !!address
  );

  // Use the custom hook to check for the Pyth data feed
  const { hasPythDataFeed, isLoading: pythLoading } = usePythDataFeed(address);

  // Fetch historical bars using the `getBars` function from your datafeed
  useEffect(() => {
    if (!tokenLoading && !pythLoading && hasPythDataFeed && tokenData) {
      const symbolInfo = {
        ticker: tokenData.symbol, // Use token symbol from fetched data
        name: tokenData.symbol,
        description: `${tokenData.symbol} Trading Pair`,
        exchange: "Pyth",
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        has_intraday: true,
        supported_resolutions: ["1", "5", "15", "30", "60", "D", "W", "M"],
        volume_precision: 2,
        data_status: "streaming",
        minmov: 1,
        pricescale: 100,
      };

      const resolution = "60"; // 60-minute candles
      const from = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 7; // 1 week ago
      const to = Math.floor(Date.now() / 1000);

      datafeed.getBars(
        symbolInfo,
        resolution,
        { from, to, firstDataRequest: true },
        (bars, { noData }) => {
          if (!noData) {
            const formattedData = bars.map((bar) => ({
              time: bar.time,
              price: bar.close,
            }));

            setChartData(formattedData);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching bars:", error);
          setIsLoading(false);
        }
      );
    }
  }, [tokenLoading, pythLoading, hasPythDataFeed, tokenData]);

  if (tokenLoading || pythLoading || isLoading) {
    return <div>Loading...</div>;
  }

  if (!hasPythDataFeed) {
    return <div>No data feed available for this token.</div>;
  }

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>{tokenData?.symbol} Price Line Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart width={730} height={250} data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleDateString()} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </CardContent>
    </Card>
  );
}

export default TokenLineChart;
