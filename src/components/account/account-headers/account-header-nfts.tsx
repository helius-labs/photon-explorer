import magicEdenLogo from "@/../public/assets/magic-eden-logo.svg";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import tensorLogo from "@/../public/assets/tensor-logo.svg";
import { useCluster } from "@/providers/cluster-provider";
import { NFT } from "@/types/nft";
import { Cluster } from "@/utils/cluster";
import { shorten, shortenLong } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { PublicKey } from "@solana/web3.js";
import Avatar from "boring-avatars";
import { CheckIcon, ChevronDownCircle, Copy, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
import { Skeleton } from "@/components/ui/skeleton";

interface AccountHeaderNFTsProps {
  address: PublicKey;
  type?: string;
  nft: NFT | null;
}

const AccountHeaderNFTs: React.FC<AccountHeaderNFTsProps> = ({
  address,
  type = "NFT",
  nft,
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const router = useRouter();
  const { cluster, endpoint } = useCluster();

  const { isLoading: nftDataLoading } = useGetNFTsByMint(
    address.toBase58(),
    true
  );

  const displayName = nft?.name || "";
  const displayImage = nft?.content?.links?.image || nft?.image || noLogoImg.src;
  const fallbackAddress = address.toBase58();

  const royaltyPercentage = nft?.royalty?.basis_points
    ? nft.royalty.basis_points / 100
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

  const isLocalOrTestNet = [
    Cluster.Localnet,
    Cluster.Testnet,
    Cluster.Custom,
  ].includes(cluster);

  if (nftDataLoading) {
    return (
      <div className="mx-[-1rem] md:mx-0">
        <Card className="mb-8 w-full space-y-4 p-6 md:space-y-6">
          <CardHeader className="relative flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6">
            <div className="relative flex-shrink-0">
              <Skeleton className="h-44 w-44 rounded-lg" />
            </div>
            <div className="flex w-full flex-col">
              <div className="flex w-full flex-col justify-between md:flex-row md:items-start">
                <div className="max-w-sm flex-grow text-center md:text-left">
                  <CardTitle className="text-3xl font-medium leading-none">
                    <div className="flex flex-col items-center md:flex-row md:justify-start">
                      <Skeleton className="h-8 w-48 mb-2" />
                      <div className="mt-2 flex space-x-2 md:ml-2 md:mt-0">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </CardTitle>
                  <div className="mt-2 text-sm text-muted-foreground flex justify-center md:justify-start">
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
              </div>
              <div className="md:text-md mt-2 max-w-md text-center text-sm text-foreground md:text-left">
                <Skeleton className="h-6 w-full mb-2" />
                <div className="mt-4 flex justify-center space-x-4 md:justify-start">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="text-md grid grid-cols-1 gap-4 text-center text-muted-foreground sm:grid-cols-2 md:text-left lg:grid-cols-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="mx-[-1rem] md:mx-0">
        <Card className="mb-8 w-full space-y-4 p-6 md:h-auto md:space-y-6">
          <CardHeader className="relative flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6">
            <div className="relative flex-shrink-0">
              {displayImage ? (
                <Image
                  loader={cloudflareLoader}
                  src={displayImage}
                  alt={displayName}
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
              {isLocalOrTestNet && (
                <div className="absolute right-2 top-2 -translate-y-1/2 translate-x-1/2 transform md:hidden">
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
            <div className="flex w-full flex-col">
              <div className="flex w-full flex-col justify-between md:flex-row md:items-start">
                <div className="max-w-sm flex-grow text-center md:text-left">
                  <CardTitle className="text-3xl font-medium leading-none">
                    <div className="flex flex-col items-center md:flex-row md:justify-start">
                      <span className="max-w-full md:max-w-none">
                        {displayName || <Address pubkey={address} short />}
                      </span>
                      <div className="mt-2 flex space-x-2 md:ml-2 md:mt-0">
                        <Badge variant="success">NFT</Badge>
                        {type === "Token2022" && (
                          <Badge variant="success">Token2022</Badge>
                        )}
                        {nft?.creators?.some(creator => creator.verified) && (
                          <Badge variant="outline">Verified</Badge>
                        )}
                        {nft?.compression?.compressed && (
                          <Badge variant="outline">Compressed</Badge>
                        )}
                      </div>
                    </div>
                  </CardTitle>
                  <div className="mt-2 text-sm text-muted-foreground">
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
                  <div className="ml-auto mt-2 hidden self-start md:mt-0 md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                        >
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
              {nft && (
                <>
                  <div className="md:text-md mt-2 max-w-md text-center text-sm text-foreground md:text-left">
                    <span>
                      {truncateDescription(nft.description || "N/A", 150)}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-center space-x-4 md:justify-start">
                    {nft.content?.links && (
                      <a
                        href={nft.content?.links.animation || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src={tensorLogo}
                          alt="Animation"
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                      </a>
                    )}
                    <a
                      href={nft.content?.links?.external_url || '#'}
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
          {nft && (
            <CardContent className="space-y-4 md:space-y-6">
              <div className="text-md grid grid-cols-1 gap-4 text-center text-muted-foreground sm:grid-cols-2 md:text-left lg:grid-cols-3">
                {nft.collection && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Collection:{" "}
                    </span>
                    {nft.collectionName ? (
                      <Link
                        href={`/address/${nft.collection}`}
                        className="text-muted-foreground hover:underline"
                      >
                        {nft.collectionName}
                      </Link>
                    ) : (
                      shorten(nft.collection)
                    )}
                  </div>
                )}
                {nft.mintAuthority && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Mint Authority:{" "}
                    </span>
                    {shorten(nft.mintAuthority)}
                  </div>
                )}
                {nft.owner && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Owner:{" "}
                    </span>
                    <Link
                      href={`/address/${nft.owner}`}
                      className="hover:underline"
                    >
                      {shorten(nft.owner)}
                    </Link>
                  </div>
                )}
                {nft.creators && nft.creators.length > 0 && (
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="flex cursor-pointer items-center justify-center font-semibold text-foreground md:justify-start">
                          Token Creators{" "}
                          <ChevronDownCircle className="ml-2 h-5 w-5" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="p-2 text-sm">
                          {nft.creators.map((creator, index) => (
                            <p key={index} className="text-muted-foreground">
                              <span className="font-semibold">
                                {shorten(creator.address)}:{" "}
                              </span>
                              {creator.share}%{" "}
                              {creator.verified ? "(Verified)" : ""}
                            </p>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                {nft.attributes && nft.attributes.length > 0 && (
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="flex cursor-pointer items-center justify-center font-semibold text-foreground md:justify-start">
                          Attributes{" "}
                          <ChevronDownCircle className="ml-2 h-5 w-5" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="p-2 text-sm">
                          {nft.attributes.map((attribute, index) => (
                            <p key={index} className="text-muted-foreground">
                              <span className="font-semibold">
                                {attribute.trait_type}:{" "}
                              </span>
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
                    <span className="font-semibold text-foreground">
                      Royalty:{" "}
                    </span>
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
