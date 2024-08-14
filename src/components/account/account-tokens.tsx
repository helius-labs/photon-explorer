"use client";

import solLogo from "@/../public/assets/solanaLogoMark.svg";
import { useCluster } from "@/providers/cluster-provider";
import { lamportsToSolString } from "@/utils/common";
import { formatCurrencyValue, formatLargeSize, formatNumericValue } from "@/utils/numbers";
import { Token } from "@/types/token";
import { normalizeTokenAmount } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { useGetTokensByOwner } from "@/hooks/useGetTokensByOwner";
import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { Cluster } from "@/utils/cluster";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import birdeyeIcon from "@/../public/assets/birdeye.svg";
import dexscreenerIcon from "@/../public/assets/dexscreener.svg";
import { useGetBalance, useGetSolPrice } from "@/hooks/web3";
import { Skeleton } from "../ui/skeleton";

const formatPriceWithSupSub = (price: string) => {
  const [integerPart, decimalPart] = price.split(".");
  if (!decimalPart) {
    return <>{integerPart}</>;
  }

  const firstNonZeroIndex = decimalPart.search(/[^0]/);

  // Apply superscript only if leading zeros are more than 3
  if (firstNonZeroIndex > 3) {
    const leadingZerosCount = firstNonZeroIndex;
    const significantDigits = decimalPart.substring(firstNonZeroIndex);
    return (
      <>
        {integerPart}.
        0<sup>{leadingZerosCount}</sup>
        {significantDigits}
      </>
    );
  }

  return <>{price}</>;
};

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
      const price = formatNumericValue(row.original.price, 10);
      return (
        <div className="w-28">
          ${row.original.price
            ? formatPriceWithSupSub(price)
            : "N/A"}
        </div>
      );
    },
  },
  {
    header: "Charts",
    accessorKey: "charts",
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

interface AccountTokensProps {
  address: string;
  solPrice: number | null;
  accountInfo: any;
}

export default function AccountTokens({ address, solPrice, accountInfo }: AccountTokensProps) {
  const publicKey = new PublicKey(address);
  const { data, isLoading, isError } = useGetTokensByOwner(publicKey.toBase58());
  const { cluster, endpoint } = useCluster();
  const { data: compressedBalance } = useGetCompressedBalanceByOwner(publicKey.toBase58());
  const { data: solBalanceData } = useGetBalance(address);


  // Use the hook to get the SOL price
  const { data: currentSolPrice, isLoading: isSolPriceLoading } = useGetSolPrice();

  // Calculate SOL balance in SOL and USD
  const solBalanceInSol = solBalanceData ? parseFloat(lamportsToSolString(solBalanceData, 2)) : 0;
  const solBalanceUSD = currentSolPrice
    ? formatCurrencyValue(solBalanceInSol * currentSolPrice, 2)
    : null;

  const isLocalOrTestNet = [
    Cluster.Localnet,
    Cluster.Testnet,
    Cluster.Custom,
  ].includes(cluster);

  if (isError) {
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
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-[-1rem] md:mx-0">
          {/* First Card Skeleton */}
          <Card className="shadow pl-4 flex flex-col items-start">
            <Skeleton className="h-8 w-8 mt-4 mb-1" /> {/* Icon Skeleton */}
            <Skeleton className="h-4 w-36 ml-2 mb-2" /> {/* Title Skeleton */}
            <CardContent className="text-3xl md:-ml-4">
              <Skeleton className="h-6 w-40 mb-1" /> {/* Large Number Skeleton */}
            </CardContent>
          </Card>
  
          {/* Second Card Skeleton */}
          <Card className="shadow pl-4 flex flex-col items-start">
            <Skeleton className="h-8 w-8 mt-4 mb-1" /> {/* Icon Skeleton */}
            <Skeleton className="h-4 w-36 ml-2 mb-2" /> {/* Title Skeleton */}
            <CardContent className="text-3xl md:-ml-4">
              <div className="flex items-center">
                <Skeleton className="h-6 w-40 md:mr-4 mb-1" /> {/* Large Number Skeleton */}
                <Skeleton className="h-4 w-24 mt-2 md:mt-0 ml-2 md:ml-0" /> {/* Smaller Number Skeleton */}
              </div>
            </CardContent>
          </Card>
        </div>
  
        {/* Data Table Skeleton */}
        <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
          <CardContent className="flex flex-col">
            {/* Title Row Skeleton */}
            <div className="hidden md:flex justify-between gap-4 mt-6 mr-16 mb-2 py-2 px-2">
              <div className="flex items-start w-60">
                {/* Placeholder for possible title icon or empty space */}
              </div>
              <Skeleton className="h-4 w-20" /> {/* Title for "Balance" */}
              <Skeleton className="h-4 w-14" /> {/* Title for "Value" */}
              <Skeleton className="h-4 w-14" /> {/* Title for "Price" */}
              <Skeleton className="h-4 w-14" /> {/* Title for "Charts" */}
            </div>
            <div className="border-t border-bg-popover mb-2" /> {/* Separator under the title row */}
  
            {/* Mobile View Skeleton */}
            <div className="block md:hidden">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="ml-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-12 mt-1" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-3 w-8 mt-1" />
                    </div>
                  </div>
                  {index < 7 && <div className="border-t border-bg-popover" />} {/* Row Separator */}
                </div>
              ))}
            </div>
  
            {/* Desktop View Skeleton */}
            <div className="hidden md:block">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center w-60">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-14 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-14 text-left" /> {/* Align with "Balance" */}
                    <Skeleton className="h-4 w-28 text-left" /> {/* Align with "Value" */}
                    <Skeleton className="h-4 w-28 text-left" /> {/* Align with "Price" */}
                    <div className="flex w-20 space-x-2">
                      <Skeleton className="h-6 w-6 rounded-full" /> {/* Align with "Charts" */}
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                  {index < 7 && <div className="border-t border-bg-popover" />} {/* Row Separator */}
                </div>
              ))}
            </div>
          </CardContent>
  
          {/* Pagination Skeleton */}
          <div className="flex items-center justify-center px-4 py-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" /> {/* First arrow circle */}
              <Skeleton className="h-8 w-8 rounded-full" /> {/* Second arrow circle */}
              <Skeleton className="h-8 w-16" /> {/* Centered page indicator */}
              <Skeleton className="h-8 w-8 rounded-full" /> {/* Third arrow circle */}
              <Skeleton className="h-8 w-8 rounded-full" /> {/* Fourth arrow circle */}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const totalFungibleValue =
    data?.reduce((accumulator, token) => {
      return accumulator + (token.value || 0);
    }, 0) || 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-[-1rem] md:mx-0">
        <Card className="shadow pl-4 flex flex-col items-left">
          <DollarSign className="text-2xl mb-2 mt-4" />
          <CardTitle className="text-sm font-medium ml-2">Token Balance</CardTitle>
          <CardContent className="text-3xl md:-ml-4">
            {formatCurrencyValue(totalFungibleValue)}
          </CardContent>
        </Card>
        <Card className="shadow pl-4 flex flex-col items-left">
        <Image
          src={solLogo}
          alt="SOL logo"
          loading="eager"
          className="h-auto w-[24px] mb-2 ml-2 mt-4"
        />
          <CardTitle className="text-sm font-medium ml-2">SOL Balance</CardTitle>
          <CardContent className="text-3xl flex items-center md:-ml-4">
            <span>{`${formatNumericValue(solBalanceInSol)} SOL`}</span>
            {solBalanceUSD && (
              <span className="text-sm mt-2 text-muted-foreground opacity-80 ml-2">
                {solBalanceUSD} USD
              </span>
            )}
            {isLocalOrTestNet && compressedBalance && compressedBalance.value && (
              <div className="flex items-center mt-2">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-black p-1.5">
                <Image
                  src={solLogo}
                  alt="SOL logo"
                  loading="eager"
                  width={24}
                  height={24}
                  className="h-auto w-[24px]"
                />
                </div>
                <span>{` | ${lamportsToSolString(compressedBalance.value, 2)} COMPRESSED SOL`}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
        <CardContent className="flex flex-col gap-4 pb-6 pt-6">
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
    </div>
  );
}