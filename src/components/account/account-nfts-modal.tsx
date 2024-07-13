"use client";

import noImg from "@/../public/assets/noimg.svg";
import { useCluster } from "@/providers/cluster-provider";
import { NFT } from "@/types/nft";
import { shorten, shortenLong } from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { X } from "lucide-react";
import Image from "next/image";
import React from "react";

import { useAllDomains } from "@/hooks/useAllDomains";

import Loading from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import noImg from "@/../public/assets/noimg.svg";
import { Button } from "@/components/ui/button";
import cloudflareLoader from "@/utils/imageLoader";
import { DAS } from "@/types/helius-sdk";
import { X } from "lucide-react";
import { useFetchDomains } from "@/hooks/useFetchDomains";
import { shorten, shortenLong } from "@/utils/common";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  // State to hold the owner's domain name
  const [ownerDomain, setOwnerDomain] = React.useState<string | null>(null);
  const { endpoint } = useCluster();

  // Fetch user domains based on the NFT owner's address
  const { data: userDomains, isLoading: loadingDomains } = useFetchDomains(
    nft?.ownership?.owner || "",
    endpoint
  );

  // Set the owner's domain name if domains are available
  React.useEffect(() => {
    if (userDomains && userDomains.length > 0) {
      const domain = "name" in userDomains[0] ? userDomains[0].name : userDomains[0].domain;
      setOwnerDomain(domain ?? null);
    }
  }, [userDomains]);

  if (!nft) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="z-50 flex h-full w-full items-center justify-center p-4 md:h-auto md:min-w-[320px] md:max-w-[600px] lg:max-w-[1000px]">
        <div className="relative max-h-full w-full max-w-screen-sm overflow-auto rounded-lg bg-background p-4 shadow-lg sm:p-8 md:max-w-screen-md lg:max-w-screen-lg">
          <Button
            onClick={onClose}
            variant="outline"
            className="absolute right-4 top-4"
          >
            <X size={24} />
          </Button>
          <div className="flex w-full flex-col items-start overflow-hidden lg:flex-row lg:items-start">
            {/* Image section for the NFT */}
            <div className="mb-4 flex-shrink-0 lg:mb-0 lg:mr-8">
              <Image
                loader={cloudflareLoader}
                src={nft.image || noImg.src}
                alt={nft.name || "Unknown NFT"}
                width={300}
                height={300}
                className="rounded-lg shadow-md"
                loading="eager"
                onError={(event: any) => {
                  event.target.id = "noimg";
                  event.target.srcset = noImg.src;
                }}
              />
            </div>
            <div className="flex-grow">
              <DialogHeader>
                <DialogTitle className="mb-2 text-xl font-bold text-foreground sm:mb-4 sm:text-2xl">
                  {nft.name || "Unknown NFT"}
                </DialogTitle>
                <DialogDescription className="mb-2 text-center text-muted-foreground sm:mb-4 lg:text-left">
                  {nft.description || "No description available"}
                </DialogDescription>
              </DialogHeader>
              {/* Details section for mobile view */}
              <div className="block lg:hidden">
                <ScrollArea style={{ maxHeight: "70vh" }}>
                  {loadingDomains ? (
                    <div className="mt-2 flex h-full items-center justify-center">
                      <Loading />
                    </div>
                  ) : (
                    <div className="mt-2 space-y-4 sm:space-y-6">
                      <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                        Details
                      </h3>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Owner: </span>
                          {ownerDomain
                            ? ownerDomain
                            : shorten(nft.owner || "Unknown")}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Mint: </span>
                          {shorten(nft.mint.toBase58() || "Unknown")}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-semibold">
                            Mint Authority:{" "}
                          </span>
                          {nft.mintAuthority ? shorten(nft.mintAuthority) : "-"}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-semibold">
                            Update Authority:{" "}
                          </span>
                          {nft.updateAuthority
                            ? shorten(nft.updateAuthority)
                            : "-"}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Collection: </span>
                          {shortenLong(nft.collection || "N/A")}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-semibold">
                            Token Standard:{" "}
                          </span>
                          {nft.tokenStandard || "N/A"}
                        </p>
                      </div>
                      {nft.creators && nft.creators.length > 0 && (
                        <>
                          <h3 className="mt-2 text-lg font-semibold text-foreground sm:mt-4 sm:text-xl">
                            Token Creators
                          </h3>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
                        </>
                      )}
                      {nft.attributes && nft.attributes.length > 0 && (
                        <>
                          <h3 className="mt-2 text-lg font-semibold text-foreground sm:mt-4 sm:text-xl">
                            Attributes
                          </h3>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                            {nft.attributes.map((attribute, index) => (
                              <p key={index} className="text-muted-foreground">
                                <span className="font-semibold">
                                  {attribute.trait_type}:{" "}
                                </span>
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
              {/* Details section for larger screens */}
              <div className="mt-2 hidden max-h-full space-y-4 overflow-auto sm:space-y-6 lg:block">
                <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                  Details
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Owner: </span>
                    {ownerDomain ? ownerDomain : shorten(nft.ownership?.owner || "Unknown")}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Mint: </span>
                    {shorten(nft.id || "Unknown")}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Mint Authority: </span>
                    {nft.mintAuthority ? shorten(nft.mintAuthority) : "-"}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Update Authority: </span>
                    {nft.updateAuthority ? shorten(nft.updateAuthority) : "-"}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Collection: </span>
                    {shortenLong(nft.collection || "N/A")}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Token Standard: </span>
                    {nft.tokenStandard || "N/A"}
                  </p>
                </div>
                {nft.creators && nft.creators.length > 0 && (
                  <>
                    <h3 className="mt-2 text-lg font-semibold text-foreground sm:mt-4 sm:text-xl">
                      Token Creators
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
                  </>
                )}
                {nft.attributes && nft.attributes.length > 0 && (
                  <>
                    <h3 className="mt-2 text-lg font-semibold text-foreground sm:mt-4 sm:text-xl">
                      Attributes
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                      {nft.attributes.map((attribute, index) => (
                        <p key={index} className="text-muted-foreground">
                          <span className="font-semibold">
                            {attribute.trait_type}:{" "}
                          </span>
                          {attribute.value}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountNFTsModal;
