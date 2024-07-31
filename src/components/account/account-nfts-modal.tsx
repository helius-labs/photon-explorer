"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { Button } from "@/components/ui/button";
import cloudflareLoader from "@/utils/imageLoader";
import { X } from "lucide-react";
import { useFetchDomains } from "@/hooks/useFetchDomains";
import { shorten } from "@/utils/common";
import { ScrollArea } from "@/components/ui/scroll-area";
import Loading from "@/components/common/loading";
import { useCluster } from "@/providers/cluster-provider";
import { NFT } from "@/types/nft";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AccountNFTsModalProps {
  nft: NFT | null;
  isOpen: boolean;
  onClose: () => void;
}

const AccountNFTsModal: React.FC<AccountNFTsModalProps> = ({
  nft,
  isOpen,
  onClose,
}) => {
  const [ownerDomain, setOwnerDomain] = React.useState<string | null>(null);
  const { endpoint } = useCluster();

  const { data: userDomains, isLoading: loadingDomains } = useFetchDomains(
    nft?.owner || "",
    endpoint
  );

  React.useEffect(() => {
    if (userDomains && userDomains.length > 0) {
      const domain = "name" in userDomains[0] ? userDomains[0].name : userDomains[0].domain;
      setOwnerDomain(domain ?? null);
    }
  }, [userDomains]);

  if (!nft) return null;

  const tokenImage = nft.image || noLogoImg.src;
  const royaltyPercentage = nft.raw?.royalty?.basis_points ? nft.raw.royalty.basis_points / 100 : 0;

  const truncateDescription = (description: string, length: number) => {
    return description.length > length ? description.substring(0, length) + '...' : description;
  };

  const truncatedDescription = truncateDescription(nft.description || "No description available", 245);

  const truncateValue = (value: string, length: number) => {
    return value.length > length ? value.substring(0, length) + '...' : value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="z-50 rounded-lg p-6 sm:p-8 w-full max-w-5xl max-h-[80vh] overflow-y-auto">
        <div className="relative w-full h-full">
          <DialogClose asChild>
            <Button
              onClick={onClose}
              variant="outline"
              className="absolute top-4 right-4"
            >
              <X size={24} />
            </Button>
          </DialogClose>
          <div className="flex flex-col lg:flex-row lg:items-start w-full h-full">
            <div className="flex-shrink-0 mb-4 lg:mb-0 lg:mr-8 w-full lg:w-auto">
              <Image
                loader={cloudflareLoader}
                src={tokenImage}
                alt={nft.name || "Unknown NFT"}
                width={300}
                height={300}
                className="rounded-lg shadow-md"
                loading="eager"
                onError={(event: any) => {
                  event.target.id = "noLogoImg";
                  event.target.srcset = noLogoImg.src;
                }}
              />
            </div>
            <div className="flex-grow h-full w-full lg:overflow-auto lg:flex-grow-0">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                  {nft.name || "Unknown NFT"}
                  <div className="space-x-2 mt-2 md:mt-0 md:ml-2">
                    <Badge variant="success">NFT</Badge>
                    {nft?.verified && (
                      <Badge variant="outline">Verified</Badge>
                    )}
                    {nft.compression?.compressed && (
                      <Badge variant="outline">Compressed</Badge>
                    )}
                  </div>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-center lg:text-left mb-4 max-w-lg">
                  {truncatedDescription}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="lg:h-full lg:max-h-[50vh] overflow-y-auto p-4 md:mt-2 w-full bg-background shadow-inner">
                {loadingDomains ? (
                  <div className="flex items-center justify-center h-full mt-2">
                    <Loading />
                  </div>
                ) : (
                  <div className="space-y-6 mt-2">
                    <h3 className="flex text-lg sm:text-xl font-semibold text-foreground">
                      Details
                      {ownerDomain && ownerDomain !== "" && (
                        <span className="ml-4 flex items-center text-xs">
                          <Badge variant="outline" className="mr-2">Owner</Badge>
                          <Link href={`/address/${nft.owner}`} className="underline text-muted-foreground">
                            {ownerDomain ? ownerDomain : shorten(nft.owner || "Unknown")}
                          </Link>
                        </span>
                      )}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                      {nft.collection && nft.collection !== "" && (
                        <div className="flex items-center truncate">
                          <Badge variant="secondary" className="mr-2">Collection</Badge>
                          <Link href={`/address/${nft.collection}`} className="underline text-muted-foreground">
                            {nft.collectionName ? nft.collectionName : shorten(nft.collection)}
                          </Link>
                        </div>
                      )}
                      {nft.mint?.toBase58 && nft.mint.toBase58() !== "" && (
                        <div className="flex items-center">
                          <Badge variant="secondary" className="mr-2">Mint</Badge>
                          <Link href={`/address/${nft.mint.toBase58()}`} className="underline text-muted-foreground">
                            {shorten(nft.mint.toBase58() || "Unknown")}
                          </Link>
                        </div>
                      )}
                      {nft.compression?.compressed && (
                        <div className="flex items-center">
                          <Badge variant="secondary" className="mr-2">Type</Badge>
                          Compressed NFT
                        </div>
                      )}
                      {royaltyPercentage > 0 && (
                        <div className="flex items-center cursor-default">
                          <Badge variant="secondary" className="mr-2">Royalty</Badge>
                          {royaltyPercentage}%
                        </div>
                      )}
                      {nft.mintAuthority && nft.mintAuthority !== "" && (
                        <div className="flex items-center cursor-default">
                          <Badge variant="secondary" className="mr-2 truncate">Mint Authority</Badge>
                          {shorten(nft.mintAuthority || "")}
                        </div>
                      )}
                      {nft.updateAuthority && nft.updateAuthority !== "" && (
                        <div className="flex items-center cursor-default">
                          <Badge variant="secondary" className="mr-2 truncate">Update Authority</Badge>
                          {shorten(nft.updateAuthority)}
                        </div>
                      )}
                    </div>
                    <Separator className="my-4" />
                    {nft.creators && nft.creators.length > 0 && (
                      <>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-4">
                          Token Creators
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {nft.creators.map((creator, index) => (
                            <div key={index} className="flex items-center truncate text-xs cursor-default">
                              <Badge variant="secondary" className="mr-2">Creator</Badge>
                              {shorten(creator.address)}: {creator.share}% {creator.verified ? "(Verified)" : ""}
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                      </>
                    )}
                    {nft.attributes && nft.attributes.length > 0 && (
                      <>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-4">
                          Attributes
                        </h3>
                        <ScrollArea className="lg:h-full lg:max-h-[50vh] overflow-y-auto p-4 md:mt-2 w-full bg-background shadow-inner">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {nft.attributes.map((attribute, index) => (
                              <div key={index} className="flex items-center text-xs cursor-default">
                                <Badge variant="secondary" className="mr-2 truncate">
                                  {attribute.trait_type && attribute.trait_type.length > 22 ? `${attribute.trait_type.substring(0, 17)}...` : attribute.trait_type}
                                </Badge>
                                {attribute.value && truncateValue(attribute.value, 60)}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountNFTsModal;
