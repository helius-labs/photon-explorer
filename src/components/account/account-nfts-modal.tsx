"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm md:max-w-xl lg:max-w-3xl max-h-[70vh] overflow-auto">
        <div className="bg-background rounded-lg shadow-lg w-full relative sm:p-8">
          <Button
            onClick={onClose}
            variant="outline"
            className="absolute top-4 right-4"
          >
            <X size={24} />
          </Button>
          <div className="flex flex-col items-center lg:flex-row lg:items-start w-full">
            <div className="flex-shrink-0 mb-4 lg:mb-0 lg:mr-8">
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
            <div className="flex-grow h-full w-full">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-4">
                  {nft.name || "Unknown NFT"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-center lg:text-left mb-2 sm:mb-4">
                  {truncatedDescription}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-full">
                {loadingDomains ? (
                  <div className="flex items-center justify-center h-full mt-2">
                    <Loading />
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6 mt-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                      Details
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {ownerDomain && ownerDomain !== "N/A...N/A" && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Owner: </span>
                          {ownerDomain ? ownerDomain : shorten(nft.owner || "Unknown")}
                        </p>
                      )}
                      {nft.mint.toBase58() && nft.mint.toBase58() !== "N/A...N/A" && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Mint: </span>
                          <Link href={`/address/${nft.mint.toBase58()}`} className="hover:underline text-muted-foreground">
                            {shorten(nft.mint.toBase58() || "Unknown")}
                          </Link>
                        </p>
                      )}
                      {nft.mintAuthority && nft.mintAuthority !== "N/A...N/A" && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Mint Authority: </span>
                          {shorten(nft.mintAuthority || "N/A")}
                        </p>
                      )}
                      {nft.updateAuthority && nft.updateAuthority !== "N/A...N/A" && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Update Authority: </span>
                          {shorten(nft.updateAuthority)}
                        </p>
                      )}
                      {nft.collection && nft.collection !== "N/A...N/A" && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Collection: </span>
                          <Link href={`/address/${nft.collection}`} className="hover:underline text-muted-foreground">
                            {nft.collectionName}
                          </Link>
                        </p>
                      )}
                      {royaltyPercentage > 0 && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Royalty: </span>
                          {royaltyPercentage}%
                        </p>
                      )}
                      {nft.compression?.compressed && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Type: </span>
                          Compressed NFT
                        </p>
                      )}
                    </div>
                    {nft.creators && nft.creators.length > 0 && (
                      <>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-2 sm:mt-4">
                          Token Creators
                        </h3>
                        <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {nft.creators.map((creator, index) => (
                            <p key={index} className="text-muted-foreground">
                              <span className="font-semibold">{shorten(creator.address)}: </span>
                              {creator.share}% {creator.verified ? "(Verified)" : ""}
                            </p>
                          ))}
                        </div>
                      </>
                    )}
                    {nft.attributes && nft.attributes.length > 0 && (
                      <>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-2 sm:mt-4">
                          Attributes
                        </h3>
                        <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {nft.attributes.map((attribute, index) => (
                            <p key={index} className="text-muted-foreground">
                              <span className="font-semibold">{attribute.trait_type}: </span>
                              {attribute.value}
                            </p>
                          ))}
                        </div>
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
