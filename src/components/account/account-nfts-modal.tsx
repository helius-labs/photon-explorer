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
import { shorten, shortenLong } from "@/utils/common";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex items-center justify-center z-50 p-4 w-full h-[70vh] md:min-w-[320px] md:max-w-[600px] lg:max-w-[1000px]">
        <div className="bg-background rounded-lg shadow-lg w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg relative p-4 sm:p-8 overflow-hidden h-full">
          <Button
            onClick={onClose}
            variant="outline"
            className="absolute top-4 right-4"
          >
            <X size={24} />
          </Button>
          <div className="flex flex-col items-start lg:flex-row lg:items-start w-full overflow-hidden h-full">
            {/* Image section for the NFT */}
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
            <div className="flex-grow overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-4">
                  {nft.name || "Unknown NFT"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-center lg:text-left mb-2 sm:mb-4">
                  {nft.description || "No description available"}
                </DialogDescription>
              </DialogHeader>
              {/* Details section */}
              <ScrollArea className="h-[calc(100%-120px)]">
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
                          {shortenLong(nft.collection || "N/A")}
                        </p>
                      )}
                      {nft.tokenStandard && nft.tokenStandard !== "N/A...N/A" && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Token Standard: </span>
                          {nft.tokenStandard || "N/A"}
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
