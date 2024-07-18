import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Avatar from "boring-avatars";
import cmcLogo from "@/../public/assets/cmcLogo.svg";
import coingeckoLogo from "@/../public/assets/coinGeckoLogo.svg";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCluster } from "@/providers/cluster-provider";
import { formatNumericValue, formatCurrencyValue, calculateMarketCap } from "@/utils/numbers";

interface AccountHeaderTokensProps {
  address: PublicKey;
}

const AccountHeaderTokens: React.FC<AccountHeaderTokensProps> = ({ address }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [coingeckoId, setCoingeckoId] = useState<string | null>(null);
  const router = useRouter();
  const { endpoint } = useCluster() as { endpoint: string };
  const { data: tokenList } = useGetTokenListStrict();
  const tokenFromList = tokenList?.find((token) => token.address === address.toBase58());
  const { data: tokenDataFromAPI } = useGetTokensByMint(address.toBase58(), !!tokenFromList);

  // Combine token list data with token data from the hook
  const tokenDetails = {
    tokenName: tokenDataFromAPI?.name || tokenFromList?.name || "N/A",
    tokenImageURI: tokenDataFromAPI?.logoURI || tokenFromList?.logoURI || null,
    tokenSymbol: tokenDataFromAPI?.symbol || tokenFromList?.symbol || "N/A",
    supply: tokenDataFromAPI?.supply !== undefined ? formatNumericValue(tokenDataFromAPI.supply) : "N/A",
    price: tokenDataFromAPI?.price !== undefined ? formatCurrencyValue(tokenDataFromAPI.price) : "N/A",
    marketCap: calculateMarketCap(tokenDataFromAPI?.supply, tokenDataFromAPI?.price),
    mint_authority: tokenDataFromAPI?.mint_authority || "N/A",
    freeze_authority: tokenDataFromAPI?.freeze_authority || "N/A",
    token_program: tokenDataFromAPI?.token_program || "N/A",
  };

  const displayName = `${tokenDetails.tokenName} (${tokenDetails.tokenSymbol})`;
  const displayImage = tokenDetails.tokenImageURI;
  const fallbackAddress = address.toBase58();

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  useEffect(() => {
    const fetchCoingeckoId = async () => {
      const response = await fetch("https://api.coingecko.com/api/v3/coins/list");
      const data = await response.json();
      const token = data.find((token: any) => token.symbol.toLowerCase() === tokenDetails.tokenSymbol.toLowerCase());
      if (token) {
        setCoingeckoId(token.id);
      }
    };

    if (tokenDetails.tokenSymbol !== "N/A") {
      fetchCoingeckoId();
    }
  }, [tokenDetails.tokenSymbol]);

  return (
    <TooltipProvider>
      <Card className="w-full mb-8 p-6 space-y-4 md:space-y-6">
        <CardHeader className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
          <div className="flex-shrink-0">
            {displayImage ? (
              <Image
                loader={cloudflareLoader}
                src={displayImage}
                alt={displayName || "Token"}
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
                name={fallbackAddress}
                variant="marble"
                colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
              />
            )}
          </div>
          <div className="flex flex-col w-full">
            <div className="flex items-start justify-between w-full">
              <div className="text-center md:text-left flex-grow">
                <CardTitle className="text-3xl font-medium leading-none">
                  <div className="flex items-center justify-center gap-2 md:justify-start">
                    {displayName !== "N/A" ? displayName : <Address pubkey={address} short />}
                    <Badge variant="success">Token</Badge>
                  </div>
                </CardTitle>
                <div className="text-sm text-muted-foreground mt-2">
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
                <div className="flex space-x-4 mt-4">
                  {coingeckoId && (
                    <a
                      href={`https://www.coingecko.com/en/coins/${coingeckoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src={coingeckoLogo}
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
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center">
                  <span className="ml-2 text-3xl text-foreground mb-4">{tokenDetails.price}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-muted-foreground">Supply: </span>
                  <span className="ml-2">{tokenDetails.supply}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-muted-foreground">Market Cap: </span>
                  <span className="ml-2">{tokenDetails.marketCap}</span>
                </div>
              </div>
              <div className="ml-4 self-start mt-2 md:mt-0">
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
          </div>
        </CardHeader>
      </Card>
    </TooltipProvider>
  );
};

export default AccountHeaderTokens;
