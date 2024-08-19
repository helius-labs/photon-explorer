import birdeyeIcon from "@/../public/assets/birdeye.svg";
import dexscreenerIcon from "@/../public/assets/dexscreener.svg";
import jupLogo from "@/../public/assets/jupLogo.png";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { shortenLong } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import {
  formatCurrencyValue,
  formatNumericValue,
  formatSupply,
} from "@/utils/numbers";
import { PublicKey } from "@solana/web3.js";
import Avatar from "boring-avatars";
import { CheckIcon, Copy, MoreVertical, Info, ChevronDown, BarChart3, ShieldCheck, BarChart3Icon, BarChart, Users, DollarSign } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { useGetTokenListVerified } from "@/hooks/jupiterTokenList";
import { useGetTokenMetrics } from "@/hooks/jupiterTokenMetrics";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";
import { usePythDataFeed } from "@/hooks/usePythDataFeed";

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
import { Tab } from "@/components/tab-nav";
import { TokenLineChart } from "@/components/token-line-chart";

interface AccountHeaderTokensProps {
  address: string;
  type?: string;
  onTabsUpdate: (tabs: Tab[]) => void;
}

const AccountHeaderTokens: React.FC<AccountHeaderTokensProps> = ({
  address,
  type = "Token",
  onTabsUpdate,
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
  } = useGetTokensByMint(address);
  const {
    data: tokenMetricsData,
    isLoading: tokenMetricsLoading,
    isError: tokenMetricsError,
  } = useGetTokenMetrics(address);
  const { hasPythDataFeed } = usePythDataFeed(address);

  // Check if the token is verified by Jupiter
  const isVerifiedByJupiter = useMemo(() => {
    if (tokenList) {
      return tokenList.some((token) => token.address === address);
    }
    return false;
  }, [tokenList, address]);

  // Update token details based on API data
  useEffect(() => {
    if (tokenListLoading || tokenDataLoading || tokenMetricsLoading) return;

    if (!tokenListError && !tokenDataError && !tokenMetricsError) {
      if (tokenList) {
        const tokenFromList = tokenList.find(
          (token) => token.address === address,
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

  // Update the tabs
  useEffect(() => {
    const tabs: Tab[] = [
      { name: "Transactions", href: `/address/${address}/history` },
      { name: "Metadata", href: `/address/${address}/metadata` },
    ];

    // Conditionally add the "Charts" tab
    if (hasPythDataFeed) {
      tabs.push({ name: "Charts", href: `/address/${address}/charts` });
    }

    onTabsUpdate(tabs);
  }, [address, onTabsUpdate, hasPythDataFeed]);

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
      <Card className="w-full border-none space-y-4 p-6 md:space-y-6">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 h-auto">
          <div className="flex items-center gap-4">
            {/* Token Image, Name, Address */}
            {tokenDetails.tokenImageURI ? (
              <Image
                loader={cloudflareLoader}
                src={tokenDetails.tokenImageURI}
                alt={tokenDetails.tokenName}
                width={52}
                height={52}
                className="rounded-full"
              />
            ) : (
              <Avatar
                size={52}
                name={address}
                variant="pixel"
                colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
              />
            )}
            <div className="flex flex-col">
              <CardTitle className="text-xl text-foreground font-['JetBrains Mono'] leading-7">
                {tokenDetails.tokenName} ({tokenDetails.tokenSymbol})
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-['Geist Mono']">
                <span>TOKEN</span>
                <div className="w-[3px] h-[3px] bg-border-prominent-hovered" />
                <span>{shortenLong(address)}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(address);
                    setHasCopied(true);
                  }}
                >
                  {hasCopied ? <CheckIcon className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex h-[68px] border border-border-prominent">
            <div className="w-[284px] flex flex-col">
              {/* Supply */}
              <div className="flex justify-between items-center px-3 py-2 border-b border-border-prominent">
                <span className="text-muted text-[13px] leading-[18px]">Supply</span>
                <span className="text-muted-foreground text-[13px] leading-[18px]">
                  9,999,999,897.67
                </span>
              </div>
              {/* Market Cap */}
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-muted text-[13px] leading-[18px]">Market Cap</span>
                <span className="text-muted-foreground text-[13px] leading-[18px]">
                  $2,098,755.578
                </span>
              </div>
            </div>
            {/* Jupiter Verified and Charts Section */}
            <div className="border-l border-border-prominent flex flex-col">
              {/* Jupiter Verified */}
              <div className="flex justify-start items-center gap-2 px-3 py-2 border-b border-border-prominent">
                <Image src={jupLogo} alt="Jupiter Logo" width={16} height={16} />
                <span className="text-muted-foreground text-[13px] leading-[18px]">Jupiter Verified</span>
              </div>
              {/* Charts */}
              <div className="flex justify-start items-center gap-2 px-3 py-2">
                <BarChart3Icon className="w-4 h-4 text-muted" />
                <span className="text-muted-foreground text-[13px] leading-[18px]">Charts</span>
              </div>
            </div>
          </div>
        </CardHeader>
        {/* Price, Holders, Daily Volume */}
        <div className="grid grid-cols-1 md:grid-cols-3 border bg-card-inner">
          <div className="flex flex-col items-center md:items-start border-r border-border p-4">
            <DollarSign className="w-6 h-6 text-foreground mb-2" />
            <div className="text-xs text-foreground uppercase">Price</div>
            <div className="text-xl text-brand font-bold mt-1">{tokenDetails.price}</div>
          </div>
  
          <div className="flex flex-col items-center md:items-start border-r border-border p-4">
            <Users className="w-6 h-6 text-foreground mb-2" />
            <div className="text-xs text-foreground uppercase">Holders</div>
            <div className="text-xl text-brand font-bold mt-1">{tokenDetails.holders}</div>
          </div>
  
          <div className="flex flex-col items-center md:items-start p-4">
            <BarChart className="w-6 h-6 text-foreground mb-2" />
            <div className="text-xs text-foreground uppercase">Daily Volume</div>
            <div className="text-xl text-brand font-bold mt-1">{tokenDetails.dailyVolume}</div>
          </div>
        </div>
      </Card>
      <TokenLineChart address={address} />
    </TooltipProvider>
  );
}  

export default AccountHeaderTokens;
