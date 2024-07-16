"use client";

import noImg from "@/../public/assets/noimg.svg";
import { useCluster } from "@/providers/cluster-provider";
import { AccountType } from "@/utils/account";
import { fetchSolPrice, lamportsToSolString, shortenLong } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import {
  AccountInfo,
  ConfirmedSignatureInfo,
  ParsedAccountData,
  PublicKey,
} from "@solana/web3.js";
import Avatar from "boring-avatars";
import { MoreVertical, CheckIcon, Copy } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import { useFetchDomains } from "@/hooks/useFetchDomains";
import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
import { getTokenPrices } from "@/server/getTokenPrice";
import solLogo from "@/../public/assets/solanaLogoMark.svg";

import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TokenDetails from "@/components/account/token-details";
import NFTDetails from "@/components/account/nft-details";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AccountHeader({
  address,
  accountInfo,
  signatures,
  accountType,
}: {
  address: PublicKey;
  accountInfo: AccountInfo<Buffer | ParsedAccountData> | null;
  signatures: ConfirmedSignatureInfo[];
  accountType: AccountType;
}) {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [tokenPrice, setTokenPrice] = useState<number | null>(null);
  const router = useRouter();
  const { endpoint, cluster } = useCluster();
  const [hasCopied, setHasCopied] = useState(false);

  const { data: compressedBalance } = useGetCompressedBalanceByOwner(address.toBase58());
  const { data: userDomains, isLoading: loadingDomains } = useFetchDomains(address.toBase58(), endpoint);
  const { data: tokenList } = useGetTokenListStrict();
  const { data: nftData } = useGetNFTsByMint(address.toBase58(), true);

  useEffect(() => {
    const getSolPrice = async () => {
      const price = await fetchSolPrice();
      setSolPrice(price);
    };
    getSolPrice();
  }, []);

  useEffect(() => {
    if (accountType === AccountType.Token && tokenList) {
      const addressStr = address.toBase58();
      const token = tokenList.find((token) => token.address === addressStr);
      if (token) {
        getTokenPrices([token.address]).then((prices) => {
          const tokenPrice = prices?.data[token.address]?.price || null;
          setTokenPrice(tokenPrice);
        });
      }
    }
  }, [accountType, address, tokenList]);

  const solBalance = accountInfo?.lamports ? parseFloat(lamportsToSolString(accountInfo.lamports, 2)) : 0;
  const solBalanceUSD = solPrice ? (solBalance * solPrice).toFixed(2) : null;

  const tokenDetails = useMemo(() => {
    const addressStr = address.toBase58();
    let name: string | null = null;
    let imageURI: string | null = null;
    let symbol: string | null = null;
    let decimals: number | null = null;

    if (tokenList) {
      const token = tokenList.find((token) => token.address === addressStr);
      if (token) {
        name = token.name || null;
        imageURI = token.logoURI || null;
        symbol = token.symbol || null;
        decimals = token.decimals || null;
      }
    }

    return { tokenName: name, tokenImageURI: imageURI, tokenSymbol: symbol, tokenDecimals: decimals };
  }, [address, tokenList]);

  const displayName = tokenDetails.tokenName || nftData?.name;
  const displayImage = tokenDetails.tokenImageURI || nftData?.image;
  const fallbackAddress = address.toBase58();

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  return (
    <div className="mb-8 flex flex-col items-center gap-4 md:flex-row">
      <div className="flex-shrink-0">
        {displayImage ? (
          <Image
            loader={cloudflareLoader}
            src={displayImage}
            alt={displayName || "Asset"}
            width={80}
            height={80}
            loading="eager"
            className="h-18 w-18 rounded-full"
            onError={(event: any) => {
              event.target.id = "noimg";
              event.target.srcset = noImg.src;
            }}
          />
        ) : (
          <Avatar
            size={80}
            name={fallbackAddress}
            variant="marble"
            colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
          />
        )}
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
        <div className="text-center text-3xl font-medium leading-none md:text-left">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            {displayName || <Address pubkey={address} short />}
            {accountType && <Badge variant="success">{accountType}</Badge>}
          </div>
          {accountType === AccountType.MetaplexNFT && nftData && (
            <div className="text-xs w-[320px] text-muted-foreground mt-2 md:mt-1">
              <span>{nftData.description || "N/A"}</span>
            </div>
          )}
          {accountType === AccountType.Token && (
            <div className="text-sm text-muted-foreground mt-2 md:mt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="mr-2 h-5 w-5 rounded-[6px] [&_svg]:size-3.5"
                      onClick={() => {
                        navigator.clipboard.writeText(address.toBase58());
                        setHasCopied(true);
                      }}
                    >
                      <span className="sr-only">Copy</span>
                      {hasCopied ? <CheckIcon /> : <Copy />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy address</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{shortenLong(address.toBase58())}</span>
                  </TooltipTrigger>
                  <TooltipContent>{address.toBase58()}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {accountType === AccountType.Wallet && accountInfo && (
            <div className="flex flex-col items-center md:items-start gap-2 text-lg text-muted-foreground mt-4 md:mt-1">
              <div className="flex items-center">
                <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-black p-1.5">
                  <Image
                    src={solLogo}
                    alt="SOL logo"
                    loading="eager"
                    width={24}
                    height={24}
                  />
                </div>
                <span>{`${lamportsToSolString(accountInfo.lamports, 2)} SOL`}</span>
                {solBalanceUSD && (
                  <span className="ml-4 text-sm text-muted-foreground opacity-80">
                    ${solBalanceUSD} USD
                  </span>
                )}
              </div>
              {compressedBalance && compressedBalance.value && (
                <div className="flex items-center">
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-black p-1.5">
                    <Image
                      src={solLogo}
                      alt="SOL logo"
                      loading="eager"
                      width={24}
                      height={24}
                    />
                  </div>
                  {` | ${lamportsToSolString(
                    compressedBalance.value,
                    2,
                  )} COMPRESSED SOL`}
                </div>
              )}
              {!loadingDomains && userDomains && userDomains.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {userDomains.slice(0, 3).map((domain) => (
                    <Badge key={domain.domain} variant="outline">
                      {domain.type === "sns-domain"
                        ? domain.name
                        : domain.domain}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {accountType === AccountType.Token && (
          <div className="mt-4 md:mt-0 flex flex-grow justify-center">
            <TokenDetails
              tokenDetails={tokenDetails}
              tokenPrice={tokenPrice}
            />
          </div>
        )}
        {accountType === AccountType.MetaplexNFT && nftData && (
          <div className="mt-4 md:mt-0 flex flex-grow justify-center">
            <NFTDetails nft={nftData} />
          </div>
        )}
      </div>
      <div className="ml-auto self-start font-medium mt-4 md:mt-0">
        <div className="ml-auto flex items-center gap-1">
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
                  router.push(`/address/${address.toBase58()}/compressed-accounts?cluster=${cluster}`);
                }}
              >
                Compressed Accounts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
