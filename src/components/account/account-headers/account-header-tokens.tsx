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
import { CheckIcon, Copy, ChevronDown, BarChart3Icon, BarChart, Users, DollarSign } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { useGetTokenListVerified } from "@/hooks/jupiterTokenList";
import { useGetTokenMetrics } from "@/hooks/jupiterTokenMetrics";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";
import { usePythDataFeed } from "@/hooks/usePythDataFeed";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TokenLineChart } from "@/components/token-line-chart";
import tokenLinesDesktop from "@/../public/assets/tokenLinesDesktop.svg";
import { Tab } from "@/components/tab-nav";
import raceStripe from "@/../public/assets/raceStripe.svg";
import dottedLines from "@/../public/assets/dottedLines.svg";

interface AccountHeaderTokensProps {
  address: PublicKey;
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
  const { cluster } = useCluster();

  const { data: tokenList, isLoading: tokenListLoading } = useGetTokenListVerified();
  const { data: tokenDataFromAPI, isLoading: tokenDataLoading } = useGetTokensByMint(address.toBase58());
  const { data: tokenMetricsData, isLoading: tokenMetricsLoading } = useGetTokenMetrics(address.toBase58());
  const { hasPythDataFeed } = usePythDataFeed(address.toBase58());

  // Update token details based on API data
  useEffect(() => {
    if (tokenListLoading || tokenDataLoading || tokenMetricsLoading) return;

    const tokenFromList = tokenList?.find((token) => token.address === address.toBase58());
    if (tokenFromList || tokenDataFromAPI) {
      setTokenDetails({
        tokenName: tokenDataFromAPI?.name || tokenFromList?.name || "",
        tokenImageURI: tokenDataFromAPI?.logoURI || tokenFromList?.logoURI || null,
        tokenSymbol: tokenDataFromAPI?.symbol || tokenFromList?.symbol || "",
        supply: tokenDataFromAPI?.supply !== undefined ? tokenDataFromAPI.supply : undefined,
        price: tokenDataFromAPI?.price !== undefined ? formatCurrencyValue(tokenDataFromAPI.price) : "",
        marketCap: tokenMetricsData?.data?.marketCap ? formatCurrencyValue(tokenMetricsData.data.marketCap) : "",
        mint_authority: tokenDataFromAPI?.mint_authority || "",
        freeze_authority: tokenDataFromAPI?.freeze_authority || "",
        token_program: tokenDataFromAPI?.token_program || "",
        dailyVolume: tokenMetricsData?.data?.dailyVolume ? formatCurrencyValue(tokenMetricsData.data.dailyVolume) : "",
        holders: tokenMetricsData?.data?.holders ? formatNumericValue(tokenMetricsData.data.holders).toString() : "",
      });
    }
  }, [tokenList, tokenDataFromAPI, tokenMetricsData, tokenListLoading, tokenDataLoading, tokenMetricsLoading, address]);

  // Update the tabs
  useEffect(() => {
    const tabs: Tab[] = [
      { name: "Transactions", href: `/address/${address}/history` },
      { name: "Metadata", href: `/address/${address}/metadata` },
    ];

    if (hasPythDataFeed) {
      tabs.push({ name: "Charts", href: `/address/${address}/charts` });
    }

    onTabsUpdate(tabs);
  }, [address, onTabsUpdate, hasPythDataFeed]);

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
                name={address.toBase58()}
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
                <span>{shortenLong(address.toBase58())}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(address.toBase58());
                    setHasCopied(true);
                  }}
                >
                  {hasCopied ? <CheckIcon className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex h-[68px] border border-border-prominent">
              <div className="w-[284px] flex flex-col">
                {/* Supply */}
                <div className="flex justify-between items-center px-3 py-2 border-b border-border-prominent">
                  <span className="text-muted text-[13px] leading-[18px]">Supply</span>
                  <span className="text-muted-foreground text-[13px] leading-[18px]">
                    {formatSupply(tokenDetails.supply, tokenDataFromAPI?.decimals || 0)}
                  </span>
                </div>
                {/* Market Cap */}
                <div className="flex justify-between items-center px-3 py-2">
                  <span className="text-muted text-[13px] leading-[18px]">Market Cap</span>
                  <span className="text-muted-foreground text-[13px] leading-[18px]">
                    {tokenDetails.marketCap ? tokenDetails.marketCap : "N/A"}
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
                {/* Charts and Popover */}
                <div className="flex justify-between items-center gap-2 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <BarChart3Icon className="w-4 h-4 text-muted" />
                    <span className="text-muted-foreground text-[13px] leading-[18px]">Charts</span>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <ChevronDown className="w-5 h-5 cursor-pointer" />
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-52">
                      <div className="flex flex-col gap-2 text-xs">
                        <a
                          href={`https://birdeye.so/token/${address.toBase58()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Image src={birdeyeIcon} alt="Birdeye" width={16} height={16} />
                          <span>View on Birdeye</span>
                        </a>
                        <a
                          href={`https://dexscreener.com/solana/${address.toBase58()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Image src={dexscreenerIcon} alt="Dexscreener" width={16} height={16} />
                          <span>View on Dexscreener</span>
                        </a>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <div className="relative w-full h-auto">
        {/* Container for both the price/holders/volume and chart */}
        <div className="relative bg-card-inner border-[16px] border-t-[2px] border-b-[2px] border-transparent"
            style={{
              backgroundImage: `url(${tokenLinesDesktop.src})`,
              backgroundSize: "150% 150%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center"
            }}>
            {/* Price, Holders, Daily Volume */}
            <div className="grid grid-cols-1 md:grid-cols-3 border border-b-0 bg-card-inner">
              <div className="flex flex-col items-center md:items-start border-r border-border p-6">
                <DollarSign className="w-6 h-6 text-foreground mb-2" />
                <div className="flex items-center text-xs uppercase bg-brand font-bold text-background-emphasized pr-2 py-0.5 relative">
                  <div className="absolute left-0 top-0 h-full flex items-center">
                    <Image
                      src={raceStripe}
                      alt="Race Stripe"
                      width={14}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="ml-6">Price</span>
                </div>
                <div className="text-xl text-foreground font-bold mt-1">{tokenDetails.price}</div>
              </div>

              <div className="flex flex-col items-center md:items-start border-r border-border p-6">
                <Users className="w-6 h-6 text-foreground mb-2" />
                <div className="flex items-center text-xs uppercase bg-brand font-bold text-background-emphasized pr-2 py-0.5 relative">
                  <div className="absolute left-0 top-0 h-full flex items-center">
                    <Image
                      src={raceStripe}
                      alt="Race Stripe"
                      width={14}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="ml-6">Holders</span>
                </div>
                <div className="text-xl text-foreground font-bold mt-1">{tokenDetails.holders}</div>
              </div>

              <div className="flex flex-col items-center md:items-start p-6">
                <BarChart className="w-6 h-6 text-foreground mb-2" />
                <div className="flex items-center text-xs uppercase bg-brand font-bold text-background-emphasized pr-2 py-0.5 relative">
                  <div className="absolute left-0 top-0 h-full flex items-center">
                    <Image
                      src={raceStripe}
                      alt="Race Stripe"
                      width={14}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="ml-6">Daily Volume</span>
                </div>
                <div className="text-xl text-foreground font-bold mt-1">{tokenDetails.dailyVolume}</div>
              </div>
            </div>
            <div className="relative border border-t-0 bg-card-inner">
            <div className="absolute inset-0 z-0">
              <Image 
                src={dottedLines} 
                alt="Dotted Lines Background" 
                layout="fill" 
                objectFit="cover" 
                className="pointer-events-none opacity-50"
              />
            </div>
            <div className="relative z-10">
              <TokenLineChart address={address.toBase58()} />
            </div>
          </div>
        </div>
      </div>
      </Card>
    </TooltipProvider>
  );
};

export default AccountHeaderTokens;
