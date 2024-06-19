"use client";

import React, { useState } from "react";
import { useSearchAssets } from "@/hooks/useSearchAssets";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "@/components/common/loading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AccountTokens({ address }: { address: string }) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const { data, isLoading, isPending, isError, refetch } = useSearchAssets(address, page, limit);

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

  const fungibleTokens = data?.fungibleTokens.sort(
    (a, b) => (b.token_info.price_info?.total_price || 0) - (a.token_info.price_info?.total_price || 0)
  );

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
    refetch();
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
      refetch();
    }
  };

  return (
    <Card className="col-span-12">
      <CardContent className="flex flex-col pt-6 gap-4">
        {fungibleTokens?.length === 0 && <p>No tokens found</p>}
        <div className="overflow-x-auto">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between text-sm font-semibold py-2">
              <div className="w-16"></div>
              <div className="flex-1 pl-6"></div>
              <div className="w-52 text-right">Balance</div>
              <div className="w-52 text-right">Value</div>
              <div className="w-52 text-right">Price</div>
            </div>
            <Separator />
            {fungibleTokens?.map((token, index) => {
              const tokenImage = token.content.links.image;
              const tokenSymbol = token.token_info.symbol || token.content.metadata.symbol || token.id;
              const tokenBalance = (token.token_info.balance / Math.pow(10, token.token_info.decimals)).toFixed(4);
              const tokenPrice = token.token_info.price_info?.price_per_token || 0;
              const tokenValue = token.token_info.price_info?.total_price?.toFixed(2) || 0;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between py-4 hover:bg-secondary transition duration-300 ease-in-out">
                    <div className="w-24 flex justify-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={tokenImage} alt={token.mint_extensions?.metadata.name} />
                        <AvatarFallback>
                          {tokenSymbol.slice(0, 1)}
                          {tokenSymbol.slice(-1)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 pl-6">
                      <div className="text-sm font-medium">{token.mint_extensions?.metadata.name || token.mint_extensions?.metadata.mint}</div>
                      <div className="text-sm">{token.token_info.symbol}</div>
                    </div>
                    <div className="w-52 text-right text-sm">
                      {tokenBalance.toLocaleString() ?? "N/A"}
                    </div>
                    <div className="w-52 text-right text-sm">
                      ${tokenValue}
                    </div>
                    <div className="w-52 text-right text-sm">
                      ${tokenPrice.toFixed(2) || "N/A"}
                    </div>
                  </div>
                  <Separator />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4">
            <Button disabled={page === 1} onClick={handlePreviousPage}>
              Previous
            </Button>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${limit}`}
                  onValueChange={(value) => {
                    setLimit(Number(value));
                    setPage(1); // Reset to first page whenever page size changes
                    refetch();
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={limit} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {page} of {data?.totalPages || 1}
              </div>
            </div>
            <Button onClick={handleNextPage} disabled={page >= (data?.totalPages || 1)}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
