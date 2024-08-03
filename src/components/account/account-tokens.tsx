"use client";

import solLogo from "@/../public/assets/solanaLogoMark.svg";
import { useCluster } from "@/providers/cluster-provider";
import { fetchSolPrice, lamportsToSolString } from "@/utils/common";
import { formatCurrencyValue, formatLargeSize, formatNumericValue } from "@/utils/numbers";
import { Token } from "@/types/token";
import { normalizeTokenAmount } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGetTokensByOwner } from "@/hooks/useGetTokensByOwner";
import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LottieLoader from "@/components/common/lottie-loading";
import loadingBarAnimation from '@/../public/assets/animations/loadingBar.json';
import { DollarSign } from "lucide-react";
import { PublicKey, Connection } from "@solana/web3.js";
import { Cluster } from "@/utils/cluster";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import birdeyeIcon from "@/../public/assets/birdeye.svg";
import dexscreenerIcon from "@/../public/assets/dexscreener.svg";

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

interface AccountTokensProps {
  address: string;  // Change the address type to string
  solPrice: number | null;
  accountInfo: any;
}

async function fetchSolBalance(publicKey: PublicKey, endpoint: string) {
  const connection = new Connection(endpoint);
  const balance = await connection.getBalance(publicKey);
  return balance;
}

export default function AccountTokens({ address, solPrice, accountInfo }: AccountTokensProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const publicKey = new PublicKey(address); // Convert address to PublicKey here
  const { data, isLoading, isError } = useGetTokensByOwner(publicKey.toBase58());
  const { cluster, endpoint } = useCluster();
  const { data: compressedBalance } = useGetCompressedBalanceByOwner(publicKey.toBase58());

  const [currentSolPrice, setCurrentSolPrice] = useState<number | null>(solPrice);
  const [solBalance, setSolBalance] = useState<number>(0);

  useEffect(() => {
    if (!solPrice) {
      fetchSolPrice().then((price) => setCurrentSolPrice(price));
    }
  }, [solPrice]);

  useEffect(() => {
    // Fetch the SOL balance
    fetchSolBalance(publicKey, endpoint).then((balance) => setSolBalance(balance));
  }, [publicKey, endpoint]);

  const solBalanceInSol = parseFloat(lamportsToSolString(solBalance, 2));

  const solBalanceUSD = currentSolPrice
    ? formatCurrencyValue(solBalanceInSol * currentSolPrice, 2)
    : null;

  const isLocalOrTestNet = [
    Cluster.Localnet,
    Cluster.Testnet,
    Cluster.Custom,
  ].includes(cluster);

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
          <LottieLoader animationData={loadingBarAnimation} className="h-20 w-20" />
        </CardContent>
      </Card>
    );

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
          <Image src={solLogo} alt="Solana" width={24} height={24} className="mb-2 ml-2 mt-4" />
          <CardTitle className="text-sm font-medium ml-2">SOL Balance</CardTitle>
          <CardContent className="text-3xl flex items-center md:-ml-4">
            <span>{`${formatNumericValue(solBalanceInSol)} SOL`}</span>
            {solBalanceUSD && (
              <span className="text-sm text-muted-foreground opacity-80 ml-2">
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
