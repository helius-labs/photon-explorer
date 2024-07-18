"use client";

import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Avatar from "boring-avatars";
import { useRouter } from "next/navigation";
import { CheckIcon, Copy, MoreVertical, HelpCircle } from "lucide-react";
import tensorLogo from "@/../public/assets/tensor-logo.svg";
import magicEdenLogo from "@/../public/assets/magic-eden-logo.svg";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
import { shortenLong, shorten } from "@/utils/common";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCluster } from "@/providers/cluster-provider";
import { NFT } from "@/types/nft";

interface AccountHeaderNFTsProps {
  address: PublicKey;
}

const AccountHeaderNFTs: React.FC<AccountHeaderNFTsProps> = ({ address }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const router = useRouter();
  const { data: nftData } = useGetNFTsByMint(address.toBase58(), true) as { data?: NFT };
  const { endpoint } = useCluster();

  const displayName = nftData?.name;
  const displayImage = nftData?.image;
  const fallbackAddress = address.toBase58();

  const royaltyPercentage = nftData?.royalty?.percent || 0;

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  return (
    <Card className="w-full mb-8 p-6 space-y-4 md:space-y-6 md:h-[400px]">
      <CardHeader className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
        <div className="flex-shrink-0">
          {displayImage ? (
            <Image
              loader={cloudflareLoader}
              src={displayImage}
              alt={displayName || "Asset"}
              width={180}
              height={180}
              loading="eager"
              className="rounded-lg"
              onError={(event: any) => {
                event.target.id = "noLogoImg";
                event.target.srcset = noLogoImg.src;
              }}
            />
          ) : (
            <Avatar
              size={180}
              name={fallbackAddress}
              variant="marble"
              colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
            />
          )}
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-start justify-between w-full">
            <div className="text-center md:text-left">
              <CardTitle className="text-3xl font-medium leading-none">
                <div className="flex items-center justify-center gap-2 md:justify-start">
                  {displayName || <Address pubkey={address} short />}
                  <Badge variant="success">NFT</Badge>
                  {nftData?.verified && (
                    <Badge variant="outline">Verified</Badge>
                  )}
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
            </div>
            <div className="ml-auto self-start mt-2 md:mt-0">
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
          {nftData && (
            <>
              <div className="text-md max-w-md text-muted-foreground mt-2">
                <span>{nftData.description || "N/A"}</span>
              </div>
              <div className="flex space-x-4 mt-4">
                <a
                  href={`https://www.tensor.trade/item/${address.toBase58()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={tensorLogo}
                    alt="Tensor"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                </a>
                <a
                  href={`https://magiceden.io/item-details/${address.toBase58()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={magicEdenLogo}
                    alt="Magic Eden"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                </a>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-md text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">Collection: </span>
            {shorten(nftData?.collection || "N/A")}
          </div>
          <div>
            <span className="font-semibold text-foreground">Mint Authority: </span>
            {shorten(nftData?.mintAuthority || "N/A")}
          </div>
          <div>
            <span className="font-semibold text-foreground">Owner: </span>
            {nftData?.owner ? shorten(nftData.owner) : "Unknown"}
          </div>
          <div>
            <div className="flex items-center font-semibold text-foreground cursor-pointer">
              Token Creators <HelpCircle className="ml-1 h-4 w-4" />
            </div>
            <TooltipProvider>
              {nftData?.creators && nftData.creators.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="hidden" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="p-2 text-sm">
                      {nftData.creators.map((creator, index) => (
                        <p key={index} className="text-muted-foreground">
                          <span className="font-semibold">{shorten(creator.address)}: </span>
                          {creator.share}% {creator.verified ? "(Verified)" : ""}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
          <div>
            <div className="flex items-center font-semibold text-foreground cursor-pointer">
              Attributes <HelpCircle className="ml-1 h-4 w-4" />
            </div>
            <TooltipProvider>
              {nftData?.attributes && nftData.attributes.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="hidden" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="p-2 text-sm">
                      {nftData.attributes.map((attribute, index) => (
                        <p key={index} className="text-muted-foreground">
                          <span className="font-semibold">{attribute.trait_type}: </span>
                          {attribute.value}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
          <div>
            <span className="font-semibold text-foreground">Royalty: </span>
            {royaltyPercentage ? `${royaltyPercentage}%` : "N/A"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountHeaderNFTs;
