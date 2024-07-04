"use client";

import birdeyeIcon from "@/../public/assets/birdeye.svg";
import dexscreenerIcon from "@/../public/assets/dexscreener.svg";
import noImg from "@/../public/assets/noimg.svg";
import Image from "next/image";
import { Token } from "@/types/token";
import { normalizeTokenAmount } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { ColumnDef } from "@tanstack/react-table";
import { formatLargeSize } from "@/utils/numbers";

import { useGetTokens } from "@/hooks/useGetTokens";

import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const columns: ColumnDef<Token>[] = [
  {
    header: "",
    accessorKey: "token",
    cell: ({ row }) => {
      const tokenName = row.original.name || "Unknown";
      const tokenSymbol = row.original.symbol || "Unknown";
      return (
        <div className="flex items-center">
          <Image
            loader={cloudflareLoader}
            src={row.original.logoURI || noImg.src}
            alt={tokenName}
            width={48}
            height={48}
            loading="eager"
            onError={(event: any) => {
              event.target.id = "noimg";
              event.target.srcset = noImg.src;
            }}
            className="h-12 w-12 ml-4 rounded-full"
          />
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
      return formatLargeSize(
        normalizeTokenAmount(row.original.amount, row.original.decimals).toFixed(3)
      );
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
              src={birdeyeIcon.src || noImg.src}
              alt="Birdeye"
              width={22}
              height={22}
              loading="eager"
              className="rounded-full"
            />
          </a>
          <a
            href={`https://dexscreener.com/solana/${tokenMint}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={dexscreenerIcon.src || noImg.src}
              alt="Dexscreener"
              width={22}
              height={22}
              loading="eager"
              className="rounded-full"
            />
          </a>
        </div>
      );
    },
  },
];

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
        <CardContent className="flex flex-col py-6 gap-4">
          <div className="flex justify-start font-medium text-sm">
            <Skeleton className="h-4 w-[200px] ml-2" />
          </div>
          <div className="grid grid-cols-5 px-4 items-center pb-8">
            <div className="flex items-center col-span-1 space-x-4"></div>
            <div className="col-span-1 space-y-2">
              <Skeleton className="h-4 w-[50px] ml-auto" />
            </div>
            <div className="col-span-1 space-y-2">
              <Skeleton className="h-4 w-[50px] ml-auto" />
            </div>
            <div className="col-span-1 space-y-2">
              <Skeleton className="h-4 w-[50px] ml-auto" />
            </div>
            <div className="flex col-span-1 space-x-2">
              <Skeleton className="hidden md:flex h-4 w-[50px] ml-10" />
            </div>
          </div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="grid grid-cols-5 px-4 items-center">
              <div className="flex items-center col-span-1 space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
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
        <div className="block md:hidden">
          {data?.map((token, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-2 border-b"
            >
              <div className="flex items-center">
                <Image
                  loader={cloudflareLoader}
                  src={token.logoURI || noImg.src}
                  alt={token.name || "Unknown"}
                  width={32}
                  height={32}
                  loading="eager"
                  onError={(event: any) => {
                    event.target.id = "noimg";
                    event.target.srcset = noImg.src;
                  }}
                  className="h-8 w-8 rounded-full"
                />
                <div className="ml-2">
                  <div className="text-sm font-medium">{token.name || "Unknown"}</div>
                  <div className="text-xs font-bold">{token.symbol || "Unknown"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatLargeSize(normalizeTokenAmount(token.amount, token.decimals).toFixed(3))}
                </div>
                <div className="text-xs text-gray-500">
                  {token.value ? `$${token.value.toFixed(2)}` : "N/A"}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:block">
          <DataTable columns={columns} data={data!} />
        </div>
      </CardContent>
    </Card>
  );
}
