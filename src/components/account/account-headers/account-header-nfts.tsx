import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
import Avatar from "boring-avatars";
import { useRouter } from "next/navigation";
import { CheckIcon, Copy, MoreVertical, ChevronDownCircle } from "lucide-react";
import tensorLogo from "@/../public/assets/tensor-logo.svg";
import magicEdenLogo from "@/../public/assets/magic-eden-logo.svg";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
import { shortenLong, shorten } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCluster } from "@/providers/cluster-provider";
import { NFT } from "@/types/nft";
import { Cluster } from "@/utils/cluster";

interface AccountHeaderNFTsProps {
  address: PublicKey;
}

const AccountHeaderNFTs: React.FC<AccountHeaderNFTsProps> = ({ address }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const router = useRouter();
  const { data: nftData } = useGetNFTsByMint(address.toBase58(), true) as { data?: NFT };
  const { cluster, endpoint } = useCluster();

  const displayName = nftData?.name;
  const displayImage = nftData?.image;
  const fallbackAddress = address.toBase58();

  const royaltyPercentage = nftData?.raw?.royalty?.basis_points
    ? nftData.raw.royalty.basis_points / 100
    : 0;

  const truncateDescription = (description: string, maxLength: number) => {
    if (description.length > maxLength) {
      return description.slice(0, maxLength) + "...";
    }
    return description;
  };

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const isLocalOrTestNet = [Cluster.Localnet, Cluster.Testnet, Cluster.Custom].includes(cluster);

  return (
    <TooltipProvider>
      <div className="mx-[-1rem] md:mx-0">
        <Card className="w-full mb-8 p-6 space-y-4 md:space-y-6 md:h-auto">
          <CardHeader className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 relative">
            <div className="flex-shrink-0 relative">
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
              {isLocalOrTestNet && (
                <div className="absolute top-2 right-2 md:hidden transform translate-x-1/2 -translate-y-1/2">
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
              )}
            </div>
            <div className="flex flex-col w-full">
              <div className="flex flex-col md:flex-row md:items-start justify-between w-full">
                <div className="text-center md:text-left flex-grow max-w-sm">
                  <CardTitle className="text-3xl font-medium leading-none">
                    <div className="flex flex-col items-center md:flex-row md:justify-start">
                      <span className="max-w-full md:max-w-none">
                        {displayName || <Address pubkey={address} short />}
                      </span>
                      <div className="flex space-x-2 mt-2 md:mt-0 md:ml-2">
                        <Badge variant="success">NFT</Badge>
                        {nftData?.verified && (
                          <Badge variant="outline">Verified</Badge>
                        )}
                        {nftData?.compression?.compressed && (
                          <Badge variant="outline">Compressed</Badge>
                        )}
                      </div>
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
                {isLocalOrTestNet && (
                  <div className="ml-auto self-start mt-2 md:mt-0 hidden md:block">
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
                )}
              </div>
              {nftData && (
                <>
                  <div className="text-sm text-center md:text-left md:text-md max-w-md text-foreground mt-2">
                    <span>{truncateDescription(nftData.description || "N/A", 150)}</span>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4 md:justify-start">
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
                        className="rounded-full border"
                      />
                    </a>
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          {nftData && (
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-md text-muted-foreground text-center md:text-left">
                {nftData.collection && (
                  <div>
                    <span className="font-semibold text-foreground">Collection: </span>
                    {nftData.collectionName ? (
                      <Link href={`/address/${nftData.collection}`} className="hover:underline text-muted-foreground">
                        {nftData.collectionName}
                      </Link>
                    ) : (
                      shorten(nftData.collection)
                    )}
                  </div>
                )}
                {nftData.mintAuthority && (
                  <div>
                    <span className="font-semibold text-foreground">Mint Authority: </span>
                    {shorten(nftData.mintAuthority)}
                  </div>
                )}
                {nftData.owner && (
                  <div>
                    <span className="font-semibold text-foreground">Owner: </span>
                    <Link href={`/address/${nftData.owner}`} className="hover:underline">
                      {shorten(nftData.owner)}
                    </Link>
                  </div>
                )}
                {nftData.creators && nftData.creators.length > 0 && (
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="flex items-center justify-center md:justify-start font-semibold text-foreground cursor-pointer">
                          Token Creators <ChevronDownCircle className="ml-2 h-5 w-5" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="p-2 text-sm">
                          {nftData.creators.map((creator, index) => (
                            <p key={index} className="text-muted-foreground">
                              <span className="font-semibold">{shorten(creator.address)}: </span>
                              {creator.share}% {creator.verified ? "(Verified)" : ""}
                            </p>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                {nftData.attributes && nftData.attributes.length > 0 && (
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="flex items-center justify-center md:justify-start font-semibold text-foreground cursor-pointer">
                          Attributes <ChevronDownCircle className="ml-2 h-5 w-5" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="p-2 text-sm">
                          {nftData.attributes.map((attribute, index) => (
                            <p key={index} className="text-muted-foreground">
                              <span className="font-semibold">{attribute.trait_type}: </span>
                              {attribute.value}
                            </p>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                {royaltyPercentage > 0 && (
                  <div>
                    <span className="font-semibold text-foreground">Royalty: </span>
                    {`${royaltyPercentage}%`}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default AccountHeaderNFTs;
