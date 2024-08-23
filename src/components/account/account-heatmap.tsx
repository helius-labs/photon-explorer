"use client";

import { useCluster } from "@/providers/cluster-provider";
import { getSignaturesForAddress } from "@/utils/fetchTxnSigs";
import React, { useCallback, useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";

interface Transaction {
  blockTime: number;
  signature: string;
}

interface DailyTransactions {
  [date: string]: Transaction[];
}

const COLOR_SCALE = [
  { count: 1, color: "#9be9a8" },
  { count: 5, color: "#40c463" },
  { count: 10, color: "#30a14e" },
  { count: 20, color: "#216e39" },
];

const SolanaTransactionHeatmap: React.FC<{ address: string }> = ({
  address,
}) => {
  const [dailyTransactions, setDailyTransactions] = useState<DailyTransactions>(
    {},
  );
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { endpoint } = useCluster();

  const fetchAllTransactions = useCallback(async () => {
    let allTransactions: Transaction[] = [];
    let lastSignature: string | undefined;
    const oneYearAgo = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;

    while (true) {
      try {
        const newTransactions = await getSignaturesForAddress(
          address,
          1000,
          endpoint,
          lastSignature,
        );

        if (newTransactions.length === 0) break;

        const filteredTransactions = newTransactions
          .filter((tx) => tx.blockTime && tx.blockTime >= oneYearAgo)
          .map((tx) => ({
            blockTime: tx.blockTime || 0,
            signature: tx.signature || "",
          }));

        allTransactions = [...allTransactions, ...filteredTransactions];

        if (filteredTransactions.length < newTransactions.length) break;

        lastSignature = newTransactions[newTransactions.length - 1].signature;
      } catch (error) {
        console.error("Error fetching signatures:", error);
        setError("Failed to fetch transactions. Please try again.");
        break;
      }
    }

    return allTransactions;
  }, [address, endpoint]);

  const groupTransactionsByDay = (
    transactions: Transaction[],
  ): DailyTransactions => {
    const grouped: DailyTransactions = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.blockTime * 1000).toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(tx);
    });
    return grouped;
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const allTransactions = await fetchAllTransactions();
        const grouped = groupTransactionsByDay(allTransactions);
        setDailyTransactions(grouped);
        setTotalTransactions(allTransactions.length);
      } catch (error) {
        console.error("Error fetching all transactions:", error);
        setError("Failed to fetch transactions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [fetchAllTransactions]);

  const getColor = (count: number) => {
    if (count === 0) return "transparent";
    for (let i = COLOR_SCALE.length - 1; i >= 0; i--) {
      if (count >= COLOR_SCALE[i].count) {
        return COLOR_SCALE[i].color;
      }
    }
    return COLOR_SCALE[0].color;
  };

  const renderHeatmap = () => {
    const now = new Date();
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate(),
    );

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const months = [];
    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);
      const daysInMonth = monthEnd.getDate();

      const days = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(
          monthStart.getFullYear(),
          monthStart.getMonth(),
          d,
        );
        const dateString = date.toISOString().split("T")[0];
        const transactions = dailyTransactions[dateString] || [];
        days.push({ date, count: transactions.length });
      }

      months.unshift({ name: monthNames[monthStart.getMonth()], days });
    }

    return (
      <div>
        <div className="mb-4 text-center">
          <p className="text-lg font-semibold">
            {totalTransactions.toLocaleString()} transactions in the last year.
          </p>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-4">
          {months
            .slice()
            .reverse()
            .map((month) => (
              <div key={month.name} className="rounded border p-2">
                <h3 className="mb-2 text-center font-bold">{month.name}</h3>
                <div className="grid grid-cols-7 gap-1">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs">
                      {day.charAt(0)}
                    </div>
                  ))}
                  {Array(month.days[0].date.getDay())
                    .fill(null)
                    .map((_, i) => (
                      <div key={`empty-${i}`} className="h-6"></div>
                    ))}
                  {month.days.map((day) => (
                    <div
                      key={day.date.toISOString()}
                      className="flex h-6 w-6 items-center justify-center rounded-sm"
                      style={{
                        backgroundColor: getColor(day.count),
                        border: "none",
                      }}
                      title={`${day.count} transaction${day.count !== 1 ? "s" : ""} on ${day.date.toDateString()}`}
                    >
                      <span
                        className={`text-xs ${day.count === 0 ? "text-gray-400" : "text-white"}`}
                      >
                        {day.date.getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
        <div className="flex items-center justify-center space-x-4">
          <span className="text-sm">Less</span>
          <div className="flex items-center">
            <div
              className="mr-1 h-4 w-4 border border-gray-300"
              style={{ backgroundColor: "transparent" }}
            ></div>
            <span className="text-xs">0</span>
          </div>
          {COLOR_SCALE.map((scale, index) => (
            <div key={index} className="flex items-center">
              <div
                className="mr-1 h-4 w-4"
                style={{ backgroundColor: scale.color }}
              ></div>
              <span className="text-xs">
                {scale.count}
                {index < COLOR_SCALE.length - 1
                  ? `-${COLOR_SCALE[index + 1].count - 1}`
                  : "+"}
              </span>
            </div>
          ))}
          <span className="text-sm">More</span>
        </div>
      </div>
    );
  };

  const daysInWeek = 7;
  const weeksInMonth = 5;

  if (loading) {
    return (
      <Card className="col-span-12 mx-[-1rem] mb-10 overflow-hidden shadow md:mx-0">
        <CardContent className="flex flex-col items-center gap-4 py-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-3 gap-6 w-full">
            {Array.from({ length: 12 }).map((_, monthIndex) => (
              <div key={monthIndex} className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
                <Skeleton className="h-5 w-14 mb-4" />
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: daysInWeek * weeksInMonth }).map((_, dayIndex) => (
                    <Skeleton
                      key={dayIndex}
                      className="h-5 w-5 rounded-full"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-12 mx-[-1rem] mb-10 overflow-hidden shadow md:mx-0">
        <CardContent className="flex flex-col items-center gap-4 pb-6 pt-6">
          <div className="font-semibold text-secondary">{error}</div>
          <div className="text-gray-500">
            <button
              onClick={() => window.location.reload()}
              className="text-blue-500 underline"
            >
              Refresh
            </button>{" "}
            or change networks.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-12 mx-[-1rem] mb-10 overflow-hidden shadow md:mx-0">
      <CardContent className="flex flex-col gap-4 pb-6 pt-6">
        {/* <h2 className="text-xl font-semibold">Solana Transaction Heatmap</h2> */}
        <div className="overflow-x-auto">{renderHeatmap()}</div>
      </CardContent>
    </Card>
  );
};

export default SolanaTransactionHeatmap;
