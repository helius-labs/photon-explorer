"use client";

import birdeyeIcon from "@/../public/assets/birdeye.svg";
import dexscreenerIcon from "@/../public/assets/dexscreener.svg";
import { useCluster } from "@/providers/cluster-provider";
import { DAS } from "@/types/helius-sdk/das-types";
import { Token } from "@/types/token";
import { normalizeTokenAmount } from "@/utils/common";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { useGetTokens } from "@/hooks/useGetTokens";

import { DataTable } from "@/components/data-table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import noImg from "../../../public/assets/noimg.svg";
import cloudflareLoader from "../../utils/imageLoader";

export default function AccountTokens({ address }: { address: string }) {
  const { data, isLoading, isError } = useGetTokens(address);

  if (isError)
    return (
      <Card className="col-span-12 shadow mb-10">
        <CardContent className="flex flex-col items-center pt-6 gap-4 pb-6">
          <div className="text-secondary font-semibold">
            Unable to fetch account balances
          </div>
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

  if (isLoading)
    return (
      <Card className="col-span-12 shadow mb-10">
        <CardContent className="flex flex-col pt-6 gap-4 pb-6">
          <div className="flex justify-start font-medium text-sm">
            <Skeleton className="h-4 w-[200px] ml-2" />
          </div>
          <div className="grid grid-cols-5 gap-4 pb-8">
            <div className="flex items-center col-span-1 space-x-4">
              <Skeleton className="h-4 w-[150px] ml-4" />
            </div>
            <div className="col-span-1 space-y-2">
              <Skeleton className="h-4 w-[50px] ml-20" />
            </div>
            <div className="col-span-1 space-y-2">
              <Skeleton className="h-4 w-[50px] ml-20" />
            </div>
            <div className="col-span-1 space-y-2">
              <Skeleton className="h-4 w-[50px] ml-20" />
            </div>
            <div className="flex col-span-1 space-x-2">
              <Skeleton className="hidden md:flex h-4 w-[50px] ml-10" />
            </div>
          </div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 items-center">
              <div className="flex items-center col-span-1 space-x-4">
                <Avatar className="h-12 w-12 ml-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[50px]" />
                </div>
              </div>
              <div className="hidden md:block col-span-1 space-y-2">
                <Skeleton className="h-4 w-[50px] ml-auto" />
              </div>
              <div className="hidden md:block col-span-1 space-y-2">
                <Skeleton className="h-4 w-[50px] ml-auto" />
              </div>
              <div className="hidden md:block col-span-1 space-y-2">
                <Skeleton className="h-4 w-[50px] ml-auto" />
              </div>
              <div className="hidden md:flex col-span-1 space-x-2 justify-center">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );

  const columns: ColumnDef<Token>[] = [
    {
      header: "",
      accessorKey: "token",
      cell: ({ row }) => {
        const token = row.original;

        const tokenImage = token.logoURI || noImg.src;
        const tokenName = token.name || "Unknown";
        const tokenSymbol = token.symbol || "Unknown";
        return (
          <div className="flex items-center">
            <Avatar className="h-12 w-12 ml-4">
              <AvatarImage src={tokenImage} alt={tokenName} />
              <AvatarFallback>
                <Image src={noImg.src} alt="No Image" fill />
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
      header: "Balance",
      accessorKey: "balance",
      cell: ({ row }) => {
        return normalizeTokenAmount(
          row.original.amount,
          row.original.decimals,
        ).toFixed(3);
      },
    },
    {
      header: "Value",
      accessorKey: "value",
      cell: ({ row }) => {
        return row.original.value ? `$${row.original.value.toFixed(2)}` : "N/A";
      },
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: ({ row }) => {
        return row.original.price ? `$${row.original.price.toFixed(2)}` : "N/A";
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => {
        const tokenMint = row.original.mint.toBase58();
        return (
          <div className="flex space-x-2">
            <a
              href={`https://birdeye.so/token/${tokenMint}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                loader={cloudflareLoader}
                src={birdeyeIcon.src || noImg.src}
                alt="Birdeye"
                width={100}
                height={100}
                unoptimized
                style={{ width: "auto", height: "auto" }}
                className="rounded-full icon-responsive"
              />
            </a>
            <a
              href={`https://dexscreener.com/solana/${tokenMint}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                loader={cloudflareLoader}
                src={dexscreenerIcon.src || noImg.src}
                alt="Dexscreener"
                width={100}
                height={100}
                unoptimized
                priority
                style={{ width: "auto", height: "auto" }}
                className="rounded-full icon-responsive"
              />
            </a>
          </div>
        );
      },
    },
  ];

  const totalFungibleValue =
    data?.reduce((accumulator, token) => {
      return accumulator + (token.value || 0);
    }, 0) || 0;

  return (
    <Card className="col-span-12 shadow mb-10">
      <CardContent className="flex flex-col pt-6 gap-4 pb-6">
        <div className="flex justify-start font-medium text-sm">
          Account Balance: ${totalFungibleValue.toFixed(2)}
        </div>
        <DataTable columns={columns} data={data!} />
      </CardContent>
    </Card>
  );
}
