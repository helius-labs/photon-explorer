"use client";

import birdeyeIcon from "@/../public/assets/birdeye.svg";
import dexscreenerIcon from "@/../public/assets/dexscreener.svg";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { Token } from "@/types/token";
import { normalizeTokenAmount } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { formatCurrencyValue, formatLargeSize } from "@/utils/numbers";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";

import { useGetTokensByOwner } from "@/hooks/useGetTokensByOwner";

import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/common/loading";
import LoadingBadge from "@/components/common/loading-badge";

const columns: ColumnDef<Token>[] = [
  {
    header: "",
    accessorKey: "token",
    cell: ({ row }) => {
      const tokenName = row.original.name || "Unknown";
      const tokenSymbol = row.original.symbol || "Unknown";
      const tokenMint = row.original.mint.toBase58();
      return (
        <div className="flex items-center md:w-60">
          <Link href={`/address/${tokenMint}`} passHref>
            <Image
              loader={cloudflareLoader}
              src={row.original.logoURI || noLogoImg.src}
              alt={tokenName}
              width={96}
              height={96}
              loading="eager"
              onError={(event: any) => {
                event.target.id = "noLogoImg";
                event.target.srcset = noLogoImg.src;
              }}
              className="ml-4 h-12 w-12 rounded-full"
            />
          </Link>
          <div className="ml-4">
            <Link href={`/address/${tokenMint}`} passHref>
              <span className="text-sm font-medium md:w-60">{tokenName}</span>
            <div className="text-sm font-bold">{tokenSymbol}</div>
            </Link>
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
          {row.original.value
            ? formatCurrencyValue(row.original.value, 2)
            : "N/A"}
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
          {row.original.price
            ? formatCurrencyValue(row.original.price, 2)
            : "N/A"}
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
      <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
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
      <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
        <CardContent className="flex flex-col items-center gap-4 py-6">
          <Loading className="h-12 w-12" />
          <LoadingBadge text="Loading Tokens" />
        </CardContent>
      </Card>
    );

  const totalFungibleValue =
    data?.reduce((accumulator, token) => {
      return accumulator + (token.value || 0);
    }, 0) || 0;

  return (
    <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
      <CardContent className="flex flex-col gap-4 pb-6 pt-6">
        <div className="flex justify-start text-sm font-medium">
          Account Balance: {formatCurrencyValue(totalFungibleValue, 2)}
        </div>
        <div className="block md:hidden">
          {data?.map((token, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b px-4 py-2"
            >
              <div className="flex items-center">
                <Link href={`/address/${token.mint.toBase58()}`} passHref>
                  <Image
                    loader={cloudflareLoader}
                    src={token.logoURI || noLogoImg.src}
                    alt={token.name || "Unknown"}
                    width={32}
                    height={32}
                    loading="eager"
                    onError={(event: any) => {
                      event.target.id = "noLogoImg";
                      event.target.srcset = noLogoImg.src;
                    }}
                    className="h-8 w-8 rounded-full"
                  />
                </Link>
                <div className="ml-2">
                  <Link href={`/address/${token.mint.toBase58()}`} passHref>
                    <span className="text-sm font-medium">
                      {token.name || "Unknown"}
                    </span>
                  </Link>
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
                  {token.value ? formatCurrencyValue(token.value, 2) : "N/A"}
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
