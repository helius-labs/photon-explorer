"use client";

import birdeyeIcon from "@/../public/assets/birdeye.svg";
import dexscreenerIcon from "@/../public/assets/dexscreener.svg";
import noImg from "@/../public/assets/noimg.svg";
import { Token } from "@/types/token";
import { normalizeTokenAmount } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { formatLargeSize } from "@/utils/numbers";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { useGetTokensByOwner } from "@/hooks/useGetTokensByOwner";

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
        <div className="flex items-center md:w-60">
          <Image
            loader={cloudflareLoader}
            src={row.original.logoURI || noImg.src}
            alt={tokenName}
            width={96}
            height={96}
            loading="eager"
            onError={(event: any) => {
              event.target.id = "noimg";
              event.target.srcset = noImg.src;
            }}
            className="ml-4 h-12 w-12 rounded-full"
          />
          <div className="ml-4">
            <div className="text-sm font-medium md:w-60">{tokenName}</div>
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
      return (
        <div className="w-28">
          {formatLargeSize(
            normalizeTokenAmount(
              row.original.amount,
              row.original.decimals,
            ).toFixed(3),
          )}
        </div>
      );
    },
  },
  {
    header: "Value",
    accessorKey: "value",
    cell: ({ row }) => {
      return (
        <div className="w-28">
          {row.original.value ? `$${row.original.value.toFixed(2)}` : "N/A"}
        </div>
      );
    },
  },
  {
    header: "Price",
    accessorKey: "price",
    cell: ({ row }) => {
      return (
        <div className="w-28">
          {row.original.price ? `$${row.original.price.toFixed(2)}` : "N/A"}
        </div>
      );
    },
  },
  {
    header: "Actions",
    accessorKey: "actions",
    cell: ({ row }) => {
      const tokenMint = row.original.mint.toBase58();
      return (
        <div className="flex w-20 space-x-2">
          <a
            href={`https://birdeye.so/token/${tokenMint}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={birdeyeIcon.src}
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
              src={dexscreenerIcon.src}
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
  const { data, isLoading, isError } = useGetTokensByOwner(address);

  if (isError)
    return (
      <Card className="col-span-12 mb-10 shadow">
        <CardContent className="flex flex-col items-center gap-4 pb-6 pt-6">
          <div className="font-semibold text-secondary">
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
      <Card className="col-span-12 mb-10 shadow">
        <CardContent className="flex flex-col gap-4 py-6">
          <div className="flex justify-start text-sm font-medium">
            <Skeleton className="ml-2 h-4 w-[200px]" />
          </div>
          <div className="grid grid-cols-5 items-center px-4 pb-8">
            <div className="col-span-1 flex items-center space-x-4"></div>
            <div className="col-span-1 space-y-2">
              <Skeleton className="ml-auto h-4 w-[50px]" />
            </div>
            <div className="col-span-1 space-y-2">
              <Skeleton className="ml-auto h-4 w-[50px]" />
            </div>
            <div className="col-span-1 space-y-2">
              <Skeleton className="ml-auto h-4 w-[50px]" />
            </div>
            <div className="col-span-1 flex space-x-2">
              <Skeleton className="ml-10 hidden h-4 w-[50px] md:flex" />
            </div>
          </div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="grid grid-cols-5 items-center px-4">
              <div className="col-span-1 flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[50px]" />
                </div>
              </div>
              <div className="col-span-1 hidden space-y-2 md:block">
                <Skeleton className="ml-auto h-4 w-[50px]" />
              </div>
              <div className="col-span-1 hidden space-y-2 md:block">
                <Skeleton className="ml-auto h-4 w-[50px]" />
              </div>
              <div className="col-span-1 hidden space-y-2 md:block">
                <Skeleton className="ml-auto h-4 w-[50px]" />
              </div>
              <div className="col-span-1 hidden justify-center space-x-2 md:flex">
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
    <Card className="col-span-12 mb-10 shadow">
      <CardContent className="flex flex-col gap-4 pb-6 pt-6">
        <div className="flex justify-start text-sm font-medium">
          Account Balance: ${totalFungibleValue.toFixed(2)}
        </div>
        <div className="block md:hidden">
          {data?.map((token, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b px-4 py-2"
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
                  <div className="text-sm font-medium">
                    {token.name || "Unknown"}
                  </div>
                  <div className="text-xs font-bold">
                    {token.symbol || "Unknown"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatLargeSize(
                    normalizeTokenAmount(token.amount, token.decimals).toFixed(
                      3,
                    ),
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {token.value ? `$${token.value.toFixed(2)}` : "N/A"}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:block">
          {data && data?.length > 0 ? (
            <DataTable columns={columns} data={data} />
          ) : (
            <p className="flex items-center justify-center p-6 text-lg text-muted-foreground">
              No Tokens found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
