"use client";

import React from "react";
import Image from "next/image";
import { useSearchAssets } from "@/hooks/useSearchAssets";
import { TokenInfoWithPubkey } from "@/hooks/useGetAccountTokens";
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
import birdeyeIcon from "@/../public/assets/birdeye.svg";
import dexscreenerIcon from "@/../public/assets/dexscreener.svg";

export default function AccountTokens({ token, address }: { token: TokenInfoWithPubkey, address: string }) {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(100);
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

  const fungibleTokens = data?.fungibleTokens;

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <Card className="col-span-12">
      <CardContent className="flex flex-col pt-6 gap-4">
        {fungibleTokens?.length === 0 && <p>No tokens found</p>}
        <div className="overflow-x-auto">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between text-sm font-semibold py-2">
              <div className="w-40"></div>
              <div className="w-20 text-right"></div>
              <div className="w-20 text-right">Balance</div>
              <div className="w-20 text-right">Value</div>
              <div className="w-20 text-right mr-1">Price</div>
            </div>
            <Separator />
            {fungibleTokens?.map((fungibleToken, index) => {
              const tokenImage = fungibleToken.content.links.image || token?.logoURI;
              const tokenName = fungibleToken.content.metadata.name || token?.name || "Unknown";
              const tokenSymbol = fungibleToken.token_info.symbol || fungibleToken.content.metadata.symbol || "Unknown";
              const tokenBalance = (fungibleToken.token_info.balance / Math.pow(10, fungibleToken.token_info.decimals)).toFixed(3);
              const tokenPrice = fungibleToken.token_info.price_info?.price_per_token || 0;
              const tokenValue = fungibleToken.token_info.price_info?.total_price?.toFixed(2) || 0;
              const tokenMint = fungibleToken.id;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between py-4 hover:bg-secondary transition duration-300 ease-in-out">
                    <div className="w-24 flex justify-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={tokenImage} alt={tokenName} />
                        <AvatarFallback>
                          {tokenSymbol.slice(0, 1)}
                          {tokenSymbol.slice(-1)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="w-80 flex pl-6 items-center">
                      <div>
                        <div className="text-sm font-medium">{tokenName}</div>
                        <div className="text-sm font-bold">{tokenSymbol}</div>
                      </div>
                    </div>
                    <div className="flex w-52 items-right">
                      <a
                        href={`https://birdeye.so/token/${tokenMint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4"
                      >
                        <Image src={birdeyeIcon.src} alt="Birdeye" width="18" height="18" className="rounded-md"/>
                      </a>
                      <a
                        href={`https://dexscreener.com/solana/${tokenMint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4"
                      >
                        <Image src={dexscreenerIcon.src} alt="Dexscreener" width="18" height="18" className="rounded-md"/>
                      </a>
                    </div>
                    <div className="w-80 text-right text-sm font-medium">
                      {tokenBalance.toLocaleString() ?? "N/A"}
                    </div>
                    <div className="w-80 text-right text-sm font-medium">
                      ${tokenValue}
                    </div>
                    <div className="w-80 text-right text-sm mr-1">
                      ${tokenPrice.toFixed(6) || "N/A"}
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
