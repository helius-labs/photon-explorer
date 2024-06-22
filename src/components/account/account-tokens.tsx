"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useGetAssetsByOwner } from "@/hooks/useGetAssetsByOwner";
import Loading from "@/components/common/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import Image from "next/image";
import birdeyeIcon from "@/../public/assets/birdeye.svg";
import dexscreenerIcon from "@/../public/assets/dexscreener.svg";
import cloudflareLoader from "../../../imageLoader";
import noImg from "../../../public/assets/noimg.svg";

export default function AccountTokens({ address }: { address: string }) {
  const { fungibleTokens, grandTotal, isLoading, isError } = useGetAssetsByOwner(address);

  if (isError)
    return (
      <Card className="col-span-12">
        <CardContent className="pt-6">
          <div>Failed to load</div>
        </CardContent>
      </Card>
    );

  if (isLoading)
    return (
      <Card className="col-span-12">
        <CardContent className="flex flex-col pt-6 gap-4">
          <Loading />
        </CardContent>
      </Card>
    );

  const columns: ColumnDef<typeof fungibleTokens[0]>[] = [
    {
      header: '',
      accessorKey: 'token',
      cell: ({ row }) => {
        const fungibleToken = row.original;
        const tokenImage = fungibleToken.content.links.image;
        const tokenName = fungibleToken.content.metadata.name || "Unknown";
        const tokenSymbol = fungibleToken.content.metadata.symbol || "Unknown";
        return (
          <div className="flex items-center">
            <Avatar className="h-12 w-12 ml-4">
              <AvatarImage src={tokenImage} alt={tokenName} />
              <AvatarFallback>
                {tokenSymbol.slice(0, 1)}
                {tokenSymbol.slice(-1)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <div className="text-sm font-medium">{tokenName}</div>
              <div className="text-sm font-bold">{tokenSymbol}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Balance',
      accessorKey: 'balance',
      cell: ({ row }) => (
        parseFloat((row.original.token_info.balance / Math.pow(10, row.original.token_info.decimals)).toFixed(3)).toLocaleString() ?? "N/A"
      ),
    },
    {
      header: 'Value',
      accessorKey: 'value',
      cell: ({ row }) => `$${row.original.token_info.price_info?.total_price?.toFixed(2) || 0}`,
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: ({ row }) => `$${row.original.token_info.price_info?.price_per_token || "N/A"}`,
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => {
        const fungibleToken = row.original;
        const tokenMint = fungibleToken.id;
        return (
          <div className="flex space-x-2">
            <a href={`https://birdeye.so/token/${tokenMint}`} target="_blank" rel="noopener noreferrer">
              <Image
                loader={cloudflareLoader}
                src={birdeyeIcon.src || noImg}
                alt="Birdeye"
                width={100}
                height={100}
                unoptimized
                style={{ width: 'auto', height: 'auto' }}
                className="rounded-full icon-responsive"
              />
            </a>
            <a href={`https://dexscreener.com/solana/${tokenMint}`} target="_blank" rel="noopener noreferrer">
              <Image
                loader={cloudflareLoader}
                src={dexscreenerIcon.src || noImg}
                alt="Dexscreener"
                width={100}
                height={100}
                unoptimized
                priority
                style={{ width: 'auto', height: 'auto' }}
                className="rounded-full icon-responsive"
              />
            </a>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="col-span-12">
      <CardContent className="flex flex-col pt-6 gap-4">
        <div className="flex justify-start mt-4 text-lg font-bold">
          Total Balance: ${grandTotal.toFixed(2)}
        </div>
        <DataTable columns={columns} data={fungibleTokens} />
      </CardContent>
    </Card>
  );
}
