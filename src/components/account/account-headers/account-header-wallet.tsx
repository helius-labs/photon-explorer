"use client";

import solLogo from "@/../public/assets/solanaLogoMark.svg";
import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { lamportsToSolString, shorten } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";
import Avatar from "boring-avatars";
import { CheckIcon, Copy, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
import { useFetchDomains } from "@/hooks/useFetchDomains";
import { useWalletLabel } from "@/hooks/useWalletLabel";

import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AccountHeaderWalletsProps {
  address: PublicKey;
  accountInfo: any;
}

const AccountHeaderWallets: React.FC<AccountHeaderWalletsProps> = ({
  address,
  accountInfo,
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const router = useRouter();
  const { cluster, endpoint } = useCluster();
  const { data: compressedBalance } = useGetCompressedBalanceByOwner(
    address.toBase58(),
  );
  const { data: userDomains, isLoading: loadingDomains } = useFetchDomains(
    address.toBase58(),
    endpoint,
  );
  const {
    label,
    isLoading: loadingLabel,
    error: labelError,
  } = useWalletLabel(address.toBase58());

  const fallbackAddress = address.toBase58();

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const isLocalOrTestNet = [
    Cluster.Localnet,
    Cluster.Testnet,
    Cluster.Custom,
  ].includes(cluster);

  const shortenedAddress = shorten(fallbackAddress, 4);

  const mainDomain =
    userDomains && userDomains.length > 0 ? userDomains[0] : null;

  return (
    <div className="mx-[-1rem] md:mx-0">
      <Card className="w-full">
        <CardHeader className="flex flex-col items-center gap-4 md:flex-row md:items-center">
          <div className="flex w-full flex-col items-center md:w-auto md:flex-row md:justify-between">
            <div className="relative flex w-full items-center justify-center md:w-auto">
              <Avatar
                size={80}
                name={fallbackAddress}
                variant="pixel"
                colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
              />
              {isLocalOrTestNet && (
                <div className="absolute right-0 md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline" className="h-8 w-8">
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          router.push(
                            `/address/${address.toBase58()}/compressed-accounts?cluster=${endpoint}`,
                          );
                        }}
                      >
                        Compressed Accounts
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex w-full flex-col items-center md:mt-0 md:flex-row md:items-center md:justify-between">
            <div className="text-center text-3xl font-medium leading-none md:text-left">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <Address pubkey={address} short showCopyButton={false} />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-2 h-5 w-5 rounded-[6px] [&_svg]:size-3.5"
                        onClick={() => {
                          navigator.clipboard.writeText(fallbackAddress);
                          setHasCopied(true);
                        }}
                      >
                        <span className="sr-only">Copy</span>
                        {hasCopied ? <CheckIcon /> : <Copy />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Copy address</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="mt-2 flex items-center justify-center md:justify-start">
                <Badge variant="success">Wallet</Badge>
                {!loadingLabel && label && (
                  <Badge variant="secondary" className="ml-2">
                    {label}
                  </Badge>
                )}
                {labelError && (
                  <Badge variant="destructive" className="ml-2">
                    Error loading label
                  </Badge>
                )}
              </div>
              <div className="mt-4 flex flex-col items-center gap-2 text-lg text-muted-foreground md:mt-2 md:items-start">
                {compressedBalance && compressedBalance.value && (
                  <div className="flex items-center">
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
                    {` | ${lamportsToSolString(
                      compressedBalance.value,
                      2,
                    )} COMPRESSED SOL`}
                  </div>
                )}
              </div>
            </div>
            <div className="ml-auto flex flex-wrap justify-center gap-2 md:justify-start">
              {!loadingDomains && mainDomain && (
                <Link href={`/address/${address.toBase58()}/domains`}>
                  <Badge variant="outline">
                    @{" "}
                    {mainDomain.type === "sns-domain"
                      ? mainDomain.name
                      : mainDomain.domain}
                  </Badge>
                </Link>
              )}
              {loadingDomains && (
                <div className="flex gap-2">
                  <Badge variant="outline" className="invisible">
                    Loading
                  </Badge>
                  <Badge variant="outline" className="invisible">
                    Loading
                  </Badge>
                  <Badge variant="outline" className="invisible">
                    Loading
                  </Badge>
                </div>
              )}
            </div>
          </div>
          {isLocalOrTestNet && (
            <div className="ml-auto mt-4 hidden md:mt-0 md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline" className="h-8 w-8">
                    <MoreVertical className="h-3.5 w-3.5" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      router.push(
                        `/address/${address.toBase58()}/compressed-accounts?cluster=${endpoint}`,
                      );
                    }}
                  >
                    Compressed Accounts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardHeader>
      </Card>
    </div>
  );
};

export default AccountHeaderWallets;
