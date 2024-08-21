"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";
import { usePythDataFeed } from "@/hooks/usePythDataFeed";
import datafeed from "@/utils/datafeed"; 

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

  const publicKey = address ? new PublicKey(address) : null;
  const { data: tokenData, isLoading: tokenLoading } = useGetTokensByMint(publicKey?.toBase58() || "", !!address);
  const { hasPythDataFeed, isLoading: pythLoading } = usePythDataFeed(address);

  useEffect(() => {
    if (!tokenLoading && !pythLoading && hasPythDataFeed && tokenData) {
      const symbolInfo = {
        ticker: tokenData?.symbol || "Unknown Symbol",
        name: tokenData?.symbol || "Unknown Name",
        description: `${tokenData?.symbol || "Unknown"} Trading Pair`,
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
      const from = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 60; // Last 60 days
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

  // Custom tick formatter to show day and month, e.g., '15 Aug'
  const formatDayMonth = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return `${day} ${month}`;
  };

  // Reduce the number of X-axis ticks by filtering the ticks within the last 7 days
  const getTicks = () => {
    const ticks = chartData.map((d) => d.time);
    const tickInterval = Math.max(1, Math.floor(ticks.length / 7)); // Show 7 ticks for each day
    return ticks.filter((_, index) => index % tickInterval === 0);
  };

  if (tokenLoading || pythLoading || isLoading) {
    return <div></div>;
  }

  if (!hasPythDataFeed) {
    return <div>No data feed available for this token.</div>;
  }

  return (
    <Card className="rounded-none shadow-lg border-none">
      <CardHeader />
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="time" 
              ticks={getTicks()} 
              tickFormatter={(time) => formatDayMonth(time)} 
              stroke="#a66559" 
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#fff',
                color: '#000',
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '10px',
                fontFamily: "'Geist Mono', monospace", 
                fontSize: '13px',
              }}
              labelStyle={{ color: '#000', fontSize: '13px' }}
              itemStyle={{ color: '#000', fontSize: '13px' }}
              labelFormatter={(label) => `Time: ${new Date(label).toLocaleString()}`}
              formatter={(value) => [`$${value}`, 'Price']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#e84125" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default TokenLineChart;
