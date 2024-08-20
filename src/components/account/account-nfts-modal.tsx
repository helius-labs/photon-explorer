"use client";

import { useCluster } from "@/providers/cluster-provider";
import { NFT } from "@/types/nft";
import { shorten } from "@/utils/common";
import { X } from "lucide-react";
import Link from "next/link";
import React from "react";

import { useFetchDomains } from "@/hooks/useFetchDomains";

import Loading from "@/components/common/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { NFTMedia } from "../common/nft-media";

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
    endpoint,
  );

  React.useEffect(() => {
    if (userDomains && userDomains.length > 0) {
      const domain =
        "name" in userDomains[0] ? userDomains[0].name : userDomains[0].domain;
      setOwnerDomain(domain ?? null);
    }
  }, [userDomains]);

  if (!nft) return null;

  const royaltyPercentage = nft.raw?.royalty?.basis_points
    ? nft.raw.royalty.basis_points / 100
    : 0;

  const truncateDescription = (description: string, length: number) => {
    return description.length > length
      ? description.substring(0, length) + "..."
      : description;
  };

  const truncatedDescription = truncateDescription(
    nft.description || "No description available",
    245,
  );

  const truncateValue = (value: string, length: number) => {
    return value.length > length ? value.substring(0, length) + "..." : value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="z-50 max-h-[80vh] w-full max-w-5xl overflow-y-auto rounded-lg p-6 sm:p-8 lg:max-h-[80vh] lg:overflow-hidden">
        <div className="flex h-full w-full flex-col lg:max-h-[80vh] lg:overflow-hidden">
          <div className="mb-4 flex justify-end">
            <DialogClose asChild>
              <Button onClick={onClose} variant="outline" className="z-10">
                <X size={24} />
              </Button>
            </DialogClose>
          </div>
          <div className="flex h-full w-full flex-col lg:flex-row lg:items-start">
            <div className="mb-4 h-72 w-full flex-shrink-0 md:w-72 lg:mb-0 lg:mr-8 lg:w-auto">
              <NFTMedia
                nft={nft}
                className="rounded-lg object-contain shadow-md"
              />
            </div>
            <div className="h-full w-full flex-grow lg:flex-grow-0 lg:overflow-hidden">
              <DialogHeader>
                <DialogTitle className="mb-2 text-xl font-bold text-foreground sm:text-2xl">
                  {nft.name || "Unknown NFT"}
                </DialogTitle>
                <div className="mb-2 flex flex-wrap">
                  <Badge variant="success" className="mb-2 mr-2">
                    NFT
                  </Badge>
                  {nft?.verified && (
                    <Badge variant="outline" className="mb-2 mr-2">
                      Verified
                    </Badge>
                  )}
                  {nft.compression?.compressed && (
                    <Badge variant="outline" className="mb-2">
                      Compressed
                    </Badge>
                  )}
                </div>
                <DialogDescription className="mb-4 max-w-lg text-left text-muted-foreground">
                  {truncatedDescription}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="w-full bg-background shadow-inner md:mt-2 lg:h-full lg:max-h-[50vh] lg:overflow-y-auto lg:p-4">
                {loadingDomains ? (
                  <div className="mt-2 flex h-full items-center justify-center">
                    <Loading />
                  </div>
                ) : (
                  <div className="mt-2 space-y-6">
                    <h3 className="flex text-lg font-semibold text-foreground sm:text-xl">
                      Details
                      {ownerDomain && ownerDomain !== "" && (
                        <span className="ml-4 flex items-center text-xs">
                          <Badge variant="outline" className="mr-2">
                            Owner
                          </Badge>
                          <Link
                            href={`/address/${nft.owner}`}
                            className="text-muted-foreground underline"
                          >
                            {ownerDomain
                              ? ownerDomain
                              : shorten(nft.owner || "Unknown")}
                          </Link>
                        </span>
                      )}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                      {nft.collection && nft.collection !== "" && (
                        <div className="flex items-center truncate">
                          <Badge variant="secondary" className="mr-2">
                            Collection
                          </Badge>
                          <Link
                            href={`/address/${nft.collection}`}
                            className="text-muted-foreground underline"
                          >
                            {nft.collectionName
                              ? nft.collectionName
                              : shorten(nft.collection)}
                          </Link>
                        </div>
                      )}
                      {nft.mint?.toBase58 && nft.mint.toBase58() !== "" && (
                        <div className="flex items-center">
                          <Badge variant="secondary" className="mr-2">
                            Mint
                          </Badge>
                          <Link
                            href={`/address/${nft.mint.toBase58()}`}
                            className="text-muted-foreground underline"
                          >
                            {shorten(nft.mint.toBase58() || "Unknown")}
                          </Link>
                        </div>
                      )}
                      {nft.compression?.compressed && (
                        <div className="flex items-center">
                          <Badge variant="secondary" className="mr-2">
                            Type
                          </Badge>
                          Compressed NFT
                        </div>
                      )}
                      {royaltyPercentage > 0 && (
                        <div className="flex cursor-default items-center">
                          <Badge variant="secondary" className="mr-2">
                            Royalty
                          </Badge>
                          {royaltyPercentage}%
                        </div>
                      )}
                      {nft.mintAuthority && nft.mintAuthority !== "" && (
                        <div className="flex cursor-default items-center">
                          <Badge variant="secondary" className="mr-2 truncate">
                            Mint Authority
                          </Badge>
                          {shorten(nft.mintAuthority || "")}
                        </div>
                      )}
                      {nft.updateAuthority && nft.updateAuthority !== "" && (
                        <div className="flex cursor-default items-center">
                          <Badge variant="secondary" className="mr-2 truncate">
                            Update Authority
                          </Badge>
                          {shorten(nft.updateAuthority)}
                        </div>
                      )}
                    </div>
                    <Separator className="my-4" />
                    {nft.creators && nft.creators.length > 0 && (
                      <>
                        <h3 className="mt-4 text-lg font-semibold text-foreground sm:text-xl">
                          Token Creators
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {nft.creators.map((creator, index) => (
                            <div
                              key={index}
                              className="flex cursor-default items-center truncate text-xs"
                            >
                              <Badge variant="secondary" className="mr-2">
                                Creator
                              </Badge>
                              {shorten(creator.address)}: {creator.share}%{" "}
                              {creator.verified ? "(Verified)" : ""}
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                      </>
                    )}
                    {nft.attributes && nft.attributes.length > 0 && (
                      <>
                        <h3 className="mt-4 text-lg font-semibold text-foreground sm:text-xl">
                          Attributes
                        </h3>
                        <ScrollArea className="max-h-[300px] overflow-y-auto">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {nft.attributes.map((attribute, index) => (
                              <div
                                key={index}
                                className="flex cursor-default items-center text-xs"
                              >
                                <Badge
                                  variant="secondary"
                                  className="mr-2 truncate"
                                >
                                  {attribute.trait_type &&
                                  attribute.trait_type.length > 20
                                    ? `${attribute.trait_type.substring(0, 17)}...`
                                    : attribute.trait_type}
                                </Badge>
                                {attribute.value &&
                                  truncateValue(attribute.value, 20)}
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
