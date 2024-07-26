import React, { useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Avatar from "boring-avatars";
import cmcLogo from "@/../public/assets/cmcLogo.svg";
import coinGeckoLogo from "@/../public/assets/coinGeckoLogo.svg";
import jupLogo from "@/../public/assets/jupLogo.png";
import { useRouter } from "next/navigation";
import { CheckIcon, Copy, MoreVertical } from "lucide-react";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";
import { shortenLong } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCluster } from "@/providers/cluster-provider";
import { formatNumericValue, formatCurrencyValue, calculateMarketCap } from "@/utils/numbers";
import { useGetTokenMetrics } from "@/hooks/jupiterTokenMetrics";

interface AccountHeaderTokensProps {
  address: PublicKey;
}

const AccountHeaderTokens: React.FC<AccountHeaderTokensProps> = ({ address }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [coingeckoId, setCoingeckoId] = useState<string | null>(null);
  const [tokenDetails, setTokenDetails] = useState<{
    tokenName: string;
    tokenImageURI: string | null;
    tokenSymbol: string;
    supply: string;
    price: string;
    marketCap: string;
    mint_authority: string;
    freeze_authority: string;
    token_program: string;
    dailyVolume?: string;
    holders?: string;
  }>({
    tokenName: "Token",
    tokenImageURI: null,
    tokenSymbol: "SYMBOL",
    supply: "",
    price: "",
    marketCap: "",
    mint_authority: "",
    freeze_authority: "",
    token_program: "",
  });

  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const { endpoint } = useCluster() as { endpoint: string };

  const { data: tokenList, isLoading: tokenListLoading, isError: tokenListError } = useGetTokenListStrict();
  const { data: tokenDataFromAPI, isLoading: tokenDataLoading, isError: tokenDataError } = useGetTokensByMint(address.toBase58());
  const { data: tokenMetricsData, isLoading: tokenMetricsLoading, isError: tokenMetricsError } = useGetTokenMetrics(address.toBase58());

  // Check if the token is verified by Jupiter
  const isVerifiedByJupiter = useMemo(() => {
    if (tokenList) {
      return tokenList.some((token) => token.address === address.toBase58());
    }
    return false;
  }, [tokenList, address]);

  // Fetch CoinGecko ID
  useEffect(() => {
    const fetchCoingeckoId = async () => {
      if (tokenDetails.tokenSymbol === "") return;

      try {
        const response = await fetch("https://api.coingecko.com/api/v3/coins/list");
        if (!response.ok) throw new Error("Failed to fetch CoinGecko data");

        const data = await response.json();
        const token = data.find((token: any) => token.symbol.toLowerCase() === tokenDetails.tokenSymbol.toLowerCase());

        if (token) setCoingeckoId(token.id);
      } catch (error) {
        console.error("Error fetching CoinGecko data:", error);
      }
    };

    fetchCoingeckoId();
  }, [tokenDetails.tokenSymbol]);

  // Update token details based on API data
  useEffect(() => {
    if (tokenListLoading || tokenDataLoading || tokenMetricsLoading) return;

    if (tokenListError || tokenDataError || tokenMetricsError) {
      if (retryCount < 3) {
        setRetryCount(retryCount + 1);
        setTimeout(() => {
          if (tokenList) {
            const tokenFromList = tokenList.find((token) => token.address === address.toBase58());
            if (tokenFromList || tokenDataFromAPI) {
              setTokenDetails({
                tokenName: tokenDataFromAPI?.name || tokenFromList?.name || "",
                tokenImageURI: tokenDataFromAPI?.logoURI || tokenFromList?.logoURI || null,
                tokenSymbol: tokenDataFromAPI?.symbol || tokenFromList?.symbol || "",
                supply: tokenDataFromAPI?.supply !== undefined ? formatNumericValue(tokenDataFromAPI.supply) : "",
                price: tokenDataFromAPI?.price !== undefined ? formatCurrencyValue(tokenDataFromAPI.price) : "",
                marketCap: calculateMarketCap(tokenDataFromAPI?.supply, tokenDataFromAPI?.price),
                mint_authority: tokenDataFromAPI?.mint_authority || "",
                freeze_authority: tokenDataFromAPI?.freeze_authority || "",
                token_program: tokenDataFromAPI?.token_program || "",
                dailyVolume: tokenMetricsData?.data?.dailyVolume ? formatCurrencyValue(tokenMetricsData.data.dailyVolume) : "",
                holders: tokenMetricsData?.data?.holders ? formatNumericValue(tokenMetricsData.data.holders).toString() : "",
              });
            }
          }
        }, 2000);
      }
    } else if (tokenList) {
      const tokenFromList = tokenList.find((token) => token.address === address.toBase58());
      if (tokenFromList || tokenDataFromAPI) {
        setTokenDetails({
          tokenName: tokenDataFromAPI?.name || tokenFromList?.name || "",
          tokenImageURI: tokenDataFromAPI?.logoURI || tokenFromList?.logoURI || null,
          tokenSymbol: tokenDataFromAPI?.symbol || tokenFromList?.symbol || "",
          supply: tokenDataFromAPI?.supply !== undefined ? formatNumericValue(tokenDataFromAPI.supply) : "",
          price: tokenDataFromAPI?.price !== undefined ? formatCurrencyValue(tokenDataFromAPI.price) : "",
          marketCap: calculateMarketCap(tokenDataFromAPI?.supply, tokenDataFromAPI?.price),
          mint_authority: tokenDataFromAPI?.mint_authority || "",
          freeze_authority: tokenDataFromAPI?.freeze_authority || "",
          token_program: tokenDataFromAPI?.token_program || "",
          dailyVolume: tokenMetricsData?.data?.dailyVolume ? formatCurrencyValue(tokenMetricsData.data.dailyVolume) : "",
          holders: tokenMetricsData?.data?.holders ? formatNumericValue(tokenMetricsData.data.holders).toString() : "",
        });
      }
    }
  }, [tokenList, tokenDataFromAPI, tokenMetricsData, tokenListLoading, tokenDataLoading, tokenMetricsLoading, tokenListError, tokenDataError, tokenMetricsError, retryCount, address]);

  // Reset copied status after a delay
  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  return (
    <TooltipProvider>
      <div className="mx-[-1rem] md:mx-0">
        <Card className="w-full mb-8 p-6 space-y-4 md:space-y-6">
          <CardHeader className="relative flex flex-col md:flex-row items-start gap-4 md:gap-6">
            <div className="flex items-center justify-center w-full md:w-auto relative">
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
                  variant="marble"
                  colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
                />
              )}
            </div>
            <div className="flex flex-col w-full md:flex-row md:justify-between">
              <div className="text-center md:text-left flex-grow max-w-xs">
                <CardTitle className="text-3xl font-medium leading-none">
                  <div className="flex flex-col items-center md:flex-row md:justify-start">
                    <span className="max-w-full md:min-w-[200px]">
                      {tokenDetails.tokenName !== "" ? tokenDetails.tokenName.slice(0, 35) + (tokenDetails.tokenName.length > 35 ? '...' : '') : <Address pubkey={address} short />}
                    </span>
                  </div>
                  {tokenDetails.tokenName !== "" && (
                    <div className="text-3xl text-muted-foreground mt-1">
                      ({tokenDetails.tokenSymbol})
                    </div>
                  )}
                  <div className="flex flex-row items-center justify-center md:inline-block md:items-start flex-shrink-0 md:flex-col mt-4 md:mt-0">
                    <Badge variant="success">Token</Badge>
                    {isVerifiedByJupiter && (
                      <Badge className="ml-2 min-w-[80px] mt-0 md:mt-2" variant="verified">
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
                <div className="text-sm text-muted-foreground mt-2">
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
                <div className="flex justify-center space-x-4 mt-4 md:justify-start">
                  {coingeckoId && (
                    <a
                      href={`https://www.coingecko.com/en/coins/${coingeckoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src={coinGeckoLogo}
                        alt="Coin Gecko Logo"
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    </a>
                  )}
                  <a
                    href={`https://coinmarketcap.com/currencies/${tokenDetails.tokenName.replace(/\s+/g, '-').toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={cmcLogo}
                      alt="Coin Market Cap Logo"
                      width={28}
                      height={28}
                      className="rounded-full bg-white"
                    />
                  </a>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end md:flex-grow-0 md:flex-shrink-0 mt-4 md:mt-0">
              <div className="flex items-center justify-center md:justify-end">
                <span className="text-3xl text-foreground">{tokenDetails.price}</span>
              </div>
              <div className="flex flex-col items-center md:items-end md:space-y-2 mt-4 md:mt-6 space-y-2">
                <div className="flex flex-col text-center md:flex-row justify-center md:justify-end text-sm space-x-2">
                  <span className="font-semibold text-muted-foreground">Supply:</span>
                  <span className="truncate md:whitespace-normal md:max-w-none">{tokenDetails.supply}</span>
                </div>
                <div className="flex flex-col text-center md:flex-row justify-center md:justify-end text-sm space-x-2">
                  <span className="font-semibold text-muted-foreground">Market Cap:</span>
                  <span className="truncate md:whitespace-normal md:max-w-none">{tokenDetails.marketCap}</span>
                </div>
                <div className="flex flex-col text-center md:flex-row justify-center md:justify-end text-sm space-x-2">
                  <span className="font-semibold text-muted-foreground">Holders:</span>
                  <span className="truncate md:whitespace-normal md:max-w-none">{tokenDetails.holders}</span>
                </div>
                <div className="flex flex-col text-center md:flex-row justify-center md:justify-end text-sm space-x-2">
                  <span className="font-semibold text-muted-foreground">Daily Volume:</span>
                  <span className="truncate md:whitespace-normal md:max-w-none">{tokenDetails.dailyVolume}</span>
                </div>
                </div>
              </div>
              <div className="ml-4 self-start mt-2 md:mt-0 hidden md:block">
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
                        router.push(`/address/${address.toBase58()}/compressed-accounts?cluster=${endpoint}`);
                      }}
                    >
                      Compressed Accounts
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="absolute top-4 right-4 md:hidden">
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
                      router.push(`/address/${address.toBase58()}/compressed-accounts?cluster=${endpoint}`);
                    }}
                  >
                    Compressed Accounts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default AccountHeaderTokens;
