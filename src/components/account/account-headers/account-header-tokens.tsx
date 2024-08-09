import birdeyeIcon from "@/../public/assets/birdeye.svg";
import dexscreenerIcon from "@/../public/assets/dexscreener.svg";
import jupLogo from "@/../public/assets/jupLogo.png";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { shortenLong } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import {
  calculateMarketCap,
  formatCurrencyValue,
  formatNumericValue,
  formatSupply,
} from "@/utils/numbers";
import { PublicKey } from "@solana/web3.js";
import Avatar from "boring-avatars";
import { CheckIcon, Copy, MoreVertical, Info } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { useGetTokenListVerified } from "@/hooks/jupiterTokenList";
import { useGetTokenMetrics } from "@/hooks/jupiterTokenMetrics";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";

import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider, Tooltip } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface AccountHeaderTokensProps {
  address: PublicKey;
  type?: string;
}

const AccountHeaderTokens: React.FC<AccountHeaderTokensProps> = ({
  address,
  type = "Token",
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<{
    tokenName: string;
    tokenImageURI: string | null;
    tokenSymbol: string;
    supply: number | undefined;
    price: string;
    marketCap: string;
    mint_authority: string;
    freeze_authority: string;
    token_program: string;
    dailyVolume?: string;
    holders?: string;
  }>({
    tokenName: "",
    tokenImageURI: null,
    tokenSymbol: "",
    supply: undefined,
    price: "",
    marketCap: "",
    mint_authority: "",
    freeze_authority: "",
    token_program: "",
  });

  const router = useRouter();
  const { cluster, endpoint } = useCluster();

  const {
    data: tokenList,
    isLoading: tokenListLoading,
    isError: tokenListError,
  } = useGetTokenListVerified();
  const {
    data: tokenDataFromAPI,
    isLoading: tokenDataLoading,
    isError: tokenDataError,
  } = useGetTokensByMint(address.toBase58());
  const {
    data: tokenMetricsData,
    isLoading: tokenMetricsLoading,
    isError: tokenMetricsError,
  } = useGetTokenMetrics(address.toBase58());

  // Check if the token is verified by Jupiter
  const isVerifiedByJupiter = useMemo(() => {
    if (tokenList) {
      return tokenList.some((token) => token.address === address.toBase58());
    }
    return false;
  }, [tokenList, address]);

  // Update token details based on API data
  useEffect(() => {
    if (tokenListLoading || tokenDataLoading || tokenMetricsLoading) return;

    if (!tokenListError && !tokenDataError && !tokenMetricsError) {
      if (tokenList) {
        const tokenFromList = tokenList.find(
          (token) => token.address === address.toBase58(),
        );
        if (tokenFromList || tokenDataFromAPI) {
          setTokenDetails({
            tokenName: tokenDataFromAPI?.name || tokenFromList?.name || "",
            tokenImageURI:
              tokenDataFromAPI?.logoURI || tokenFromList?.logoURI || null,
            tokenSymbol:
              tokenDataFromAPI?.symbol || tokenFromList?.symbol || "",
            supply:
              tokenDataFromAPI?.supply !== undefined
                ? tokenDataFromAPI.supply
                : undefined,
            price:
              tokenDataFromAPI?.price !== undefined
                ? formatCurrencyValue(tokenDataFromAPI.price)
                : "",
            marketCap: tokenMetricsData?.data?.marketCap
              ? formatCurrencyValue(tokenMetricsData?.data?.marketCap)
              : "",
            mint_authority: tokenDataFromAPI?.mint_authority || "",
            freeze_authority: tokenDataFromAPI?.freeze_authority || "",
            token_program: tokenDataFromAPI?.token_program || "",
            dailyVolume: tokenMetricsData?.data?.dailyVolume
              ? formatCurrencyValue(tokenMetricsData.data.dailyVolume)
              : "",
            holders: tokenMetricsData?.data?.holders
              ? formatNumericValue(tokenMetricsData.data.holders).toString()
              : "",
          });
        }
      }
    }
  }, [
    tokenList,
    tokenDataFromAPI,
    tokenMetricsData,
    tokenListLoading,
    tokenDataLoading,
    tokenMetricsLoading,
    tokenListError,
    tokenDataError,
    tokenMetricsError,
    address,
  ]);

  // Reset copied status after a delay
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

  if (tokenListLoading || tokenDataLoading || tokenMetricsLoading) {
    return (
      <div className="mx-[-1rem] md:mx-0">
        <Card className="mb-8 w-full space-y-4 p-4 md:p-12 md:space-y-6">
          <div className="relative flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6">
            <Skeleton className="h-20 w-20 rounded-lg mt-8 md:mt-0" />
            <div className="flex w-full flex-col md:flex-row md:justify-between">
              <div className="max-w-xs flex-grow text-center md:text-left">
              <div className="text-3xl font-medium leading-none flex flex-col items-center md:flex-row md:justify-start">
                <Skeleton className="h-8 w-44 mb-2 md:mb-2" />
                <Skeleton className="h-8 w-24 mb-2 md:ml-2 md:mb-2" />
              </div>
                <div className="flex justify-center space-x-4 md:justify-start">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="ml-2 h-6 w-20" />
                </div>
                <div className="mt-2 text-sm text-muted-foreground flex justify-center md:justify-start">
                  <Skeleton className="h-4 w-34" />
                </div>
                <div className="mt-4 flex justify-center space-x-4 md:justify-start">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
              <div className="mt-4 flex flex-col items-center md:mt-0 md:flex-shrink-0 md:flex-grow-0 md:items-end">
                <Skeleton className="h-7 w-24 mb-4" />
                <div className="mt-4 flex flex-col items-center space-y-2 md:mt-6 md:items-end md:space-y-2">
                  <div className="flex flex-col justify-center space-x-2 text-center text-sm md:flex-row md:justify-end">
                    <Skeleton className="h-5 w-44 mb-2 md:mb-0" />
                  </div>
                  <div className="justify-center flex flex-col space-x-2 text-center text-sm md:flex-row md:justify-end">
                    <Skeleton className="h-5 w-24 mb-2 md:mb-0" />
                  </div>
                  <div className="justify-center flex flex-col space-x-2 text-center text-sm md:flex-row md:justify-end">
                    <Skeleton className="h-5 w-24 mb-2 md:mb-0" />
                  </div>
                  <div className="justify-center flex flex-col space-x-2 text-center text-sm md:flex-row md:justify-end">
                    <Skeleton className="h-5 w-44 mb-6 md:mb-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }  

  return (
    <TooltipProvider>
      <div className="mx-[-1rem] md:mx-0">
        <Card className="mb-8 w-full space-y-4 p-6 md:space-y-6">
          <CardHeader className="relative flex flex-col items-start gap-4 md:flex-row md:gap-6">
            <div className="relative flex w-full items-center justify-center md:w-auto">
              {tokenDetails.tokenImageURI ? (
                <Image
                  loader={cloudflareLoader}
                  src={tokenDetails.tokenImageURI}
                  alt={tokenDetails.tokenName || "Token"}
                  width={80}
                  height={80}
                  loading="eager"
                  className="rounded-lg"
                  onError={(event: any) => {
                    event.target.id = "noLogoImg";
                    event.target.srcset = noLogoImg.src;
                  }}
                />
              ) : (
                <Avatar
                  size={80}
                  name={address.toBase58()}
                  variant="pixel"
                  colors={[
                    "#D31900",
                    "#E84125",
                    "#9945FF",
                    "#14F195",
                    "#000000",
                  ]}
                />
              )}
            </div>
            <div className="flex w-full flex-col md:flex-row md:justify-between">
              <div className="max-w-xs flex-grow text-center md:text-left">
                <CardTitle className="text-3xl font-medium leading-none">
                  <div className="flex flex-col items-center md:flex-row md:justify-start">
                    <div className="flex flex-col items-center md:flex-row md:items-center">
                      <span className="max-w-full">
                        {tokenDetails.tokenName || (
                          <Address pubkey={address} short />
                        )}
                        <span
                          className={`ml-2 hidden text-3xl text-muted-foreground md:inline ${tokenDetails.tokenName.length > 25 ? "md:hidden" : ""}`}
                        >
                          ({tokenDetails.tokenSymbol})
                        </span>
                      </span>
                      {tokenDetails.tokenName !== "" && (
                        <div
                          className={`mt-1 text-3xl text-muted-foreground ${tokenDetails.tokenName.length <= 25 ? "md:hidden" : "md:block"}`}
                        >
                          ({tokenDetails.tokenSymbol})
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-shrink-0 flex-row items-center justify-center md:mt-0 md:inline-block md:flex-col md:items-start">
                    <Badge variant="success">{type}</Badge>
                    {isVerifiedByJupiter && (
                      <Badge
                        className="ml-2 mt-0 min-w-[80px] md:mt-2"
                        variant="verified"
                      >
                        Verified
                        <Image
                          src={jupLogo}
                          alt="JUP Logo"
                          width={16}
                          height={16}
                          className="ml-1"
                        />
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <div className="mt-2 text-sm text-muted-foreground">
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
                  <span>{shortenLong(address.toBase58())}</span>
                </div>
                <div className="mt-4 flex justify-center space-x-4 md:justify-start">
                  <a
                    href={`https://birdeye.so/token/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Birdeye"
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
                    href={`https://dexscreener.com/solana/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Dex Screener"
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
              </div>
              <div className="mt-4 flex flex-col items-center md:mt-0 md:flex-shrink-0 md:flex-grow-0 md:items-end">
                <div className="flex items-center justify-center md:justify-end">
                  <span className="text-3xl text-foreground">
                    {tokenDetails.price}
                  </span>
                </div>
                <div className="mt-4 flex flex-col items-center space-y-2 md:mt-6 md:items-end md:space-y-2">
                  <div className="flex flex-col justify-center space-x-2 text-center text-sm md:flex-row md:justify-end">
                    <span className="font-semibold text-muted-foreground">
                      Supply:
                    </span>
                    <span className="truncate md:max-w-none md:whitespace-normal">
                      {formatSupply(
                        tokenDetails.supply,
                        tokenDataFromAPI?.decimals || 0,
                      )}
                    </span>
                  </div>
                  {tokenDetails.marketCap && tokenDetails.marketCap !== "" && (
                    <div className="justifycenter flex flex-col space-x-2 text-center text-sm md:flex-row md:justify-end">
                      <span className="font-semibold text-muted-foreground">
                        Market Cap:
                      </span>
                      <span className="truncate md:max-w-none md:whitespace-normal">
                        {tokenDetails.marketCap}
                      </span>
                    </div>
                  )}

                  {tokenDetails.holders && tokenDetails.holders !== "" && (
                    <div className="flex flex-col items-center md:flex-row md:justify-end md:space-x-2 text-center text-sm">
                      <span className="flex items-center font-semibold text-muted-foreground">
                        Holders
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="ml-1 md:ml-2">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <p className="text-sm text-center">On-chain token holders</p>
                          </PopoverContent>
                        </Popover>
                      </span>
                      <span className="truncate md:max-w-none md:whitespace-normal">
                        {tokenDetails.holders}
                      </span>
                    </div>
                  )}
                  {tokenDetails.dailyVolume && tokenDetails.dailyVolume !== "" && (
                    <div className="flex flex-col items-center md:flex-row md:justify-end md:space-x-2 text-center text-sm">
                      <span className="flex items-center font-semibold text-muted-foreground">
                        Daily Volume
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="ml-1 md:ml-2">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <p className="text-sm text-center">24hr Solana DEX Volume</p>
                          </PopoverContent>
                        </Popover>
                      </span>
                      <span className="truncate md:max-w-none md:whitespace-normal">
                        {tokenDetails.dailyVolume}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {isLocalOrTestNet && (
                <div className="ml-4 mt-2 hidden self-start md:mt-0 md:block">
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
            {isLocalOrTestNet && (
              <div className="absolute right-4 top-4 md:hidden">
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
    </TooltipProvider>
  );
};

export default AccountHeaderTokens;
