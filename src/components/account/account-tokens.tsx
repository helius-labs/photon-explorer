"use client";

import React from "react";
import { useSearchAssets } from "@/hooks/useSearchAssets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "@/components/common/loading";

export default function AccountTokens({ address }: { address: string }) {
  const { data, isLoading, isPending, isError } = useSearchAssets(address);

  if (isError)
    return (
      <Card className="col-span-12">
        <CardContent className="pt-6">
          <div>Failed to load</div>
        </CardContent>
      </Card>
    );

  if (isLoading || isPending)
    return (
      <Card className="col-span-12">
        <CardContent className="flex flex-col pt-6 gap-4">
          <Loading />
        </CardContent>
      </Card>
    );

  const sortedTokens = data?.sort(
    (a, b) => (b.value || 0) - (a.value || 0)
  );

  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle>Account Tokens</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col pt-6 gap-4">
        {sortedTokens?.length === 0 && <p>No tokens found</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white border-opacity-10 text-sm leading-6">
              <tr>
                <th className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"></th>
                <th className="py-2 pl-0 pr-8 font-semibold">Symbol</th>
                <th className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20">Balance</th>
                <th className="py-2 pl-0 pr-8 font-semibold lg:pr-20">Price</th>
                <th className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-6 lg:pr-8">Value (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white divide-opacity-5">
              {sortedTokens?.map((token, index) => (
                <tr key={index} className="hover:bg-secondary transition duration-300 ease-in-out">
                  <td className="py-4 pl-4 sm:pl-6 lg:pl-8">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={token.image} alt={token.name} />
                      <AvatarFallback>
                        {token.symbol.slice(0, 1)}
                        {token.symbol.slice(-1)}
                      </AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="py-4 pl-0 pr-4 sm:pr-8">
                    <div className="text-sm font-medium">
                      {token.name || token.mint}
                    </div>
                    <div className="text-sm text-gray-400">
                      {token.symbol}
                    </div>
                  </td>
                  <td className="py-4 pl-0 pr-4 text-right sm:pr-8 sm:text-left lg:pr-20">
                    <div className="text-sm">
                      {(token.value / token.price)?.toLocaleString(undefined, { maximumFractionDigits: 9 }) ?? "N/A"}
                    </div>
                  </td>
                  <td className="py-4 pl-0 pr-8 text-sm lg:pr-20">
                    ${token.price?.toFixed(2) || "N/A"}
                  </td>
                  <td className="py-4 pl-0 pr-4 text-right text-sm sm:pr-6 lg:pr-8">
                    ${token.value?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
