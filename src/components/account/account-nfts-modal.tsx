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
import noImg from "@/../public/assets/noimg.svg";
import { Button } from "@/components/ui/button";
import cloudflareLoader from "@/utils/imageLoader";
import { DAS } from "@/types/helius-sdk";
import { X } from "lucide-react";
import { useUserDomains } from "@/utils/name-service";
import { shorten, shortenLong } from "@/utils/common";
import { ScrollArea } from "@/components/ui/scroll-area";
import Loading from "@/components/common/loading";

interface AccountNFTsModalProps {
  nft: DAS.GetAssetResponse | null;
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
  // Fetch user domains based on the NFT owner's address
  const [userDomains, loading] = useUserDomains(nft?.ownership?.owner || "");

  // Set the owner's domain name if domains are available
  React.useEffect(() => {
    if (userDomains && userDomains.length > 0) {
      setOwnerDomain(userDomains[0].name);
    }
  }, [userDomains]);

  if (!nft) return null;

  // Determine the token image URL
  const tokenImage = nft.content?.links?.image || noImg.src;

  // Extract the update authority, handle case where it might be missing
  const updateAuthority = nft.mint_extensions?.metadata_pointer?.authority || "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex items-center justify-center z-50 p-4 w-full h-full md:h-auto md:min-w-[320px] md:max-w-[600px] lg:max-w-[1000px]">
        <div className="bg-background rounded-lg shadow-lg w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg relative p-4 sm:p-8 overflow-auto max-h-full">
          <Button
            onClick={onClose}
            variant="outline"
            className="absolute top-4 right-4"
          >
            <X size={24} />
          </Button>
          <div className="flex flex-col items-start lg:flex-row lg:items-start w-full overflow-hidden">
            {/* Image section for the NFT */}
            <div className="flex-shrink-0 mb-4 lg:mb-0 lg:mr-8">
              <Image
                loader={cloudflareLoader}
                src={tokenImage}
                alt={nft.content?.metadata?.name || "Unknown NFT"}
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
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-4">
                  {nft.content?.metadata?.name || "Unknown NFT"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-center lg:text-left mb-2 sm:mb-4">
                  {nft.content?.metadata?.description || "No description available"}
                </DialogDescription>
              </DialogHeader>
              {/* Details section for mobile view */}
              <div className="block lg:hidden">
                <ScrollArea style={{ maxHeight: '70vh' }}>
                  {loading ? (
                    <div className="flex items-center justify-center h-full mt-2">
                      <Loading />
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6 mt-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                        Details
                      </h3>
                      <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                          {shorten(nft.token_info?.mint_authority || "N/A")}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Update Authority: </span>
                          {shorten(updateAuthority)}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Collection: </span>
                          {shortenLong(nft.grouping?.find(group => group.group_key === 'collection')?.group_value || "N/A")}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Token Standard: </span>
                          {(nft.content?.metadata?.token_standard || "N/A")}
                        </p>
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
                      {nft.content?.metadata?.attributes && nft.content.metadata.attributes.length > 0 && (
                        <>
                          <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-2 sm:mt-4">
                            Attributes
                          </h3>
                          <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {nft.content.metadata.attributes.map((attribute, index) => (
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
              {/* Details section for larger screens */}
              <div className="hidden lg:block space-y-4 sm:space-y-6 mt-2 overflow-auto max-h-full">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  Details
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Owner Address: </span>
                    {ownerDomain ? ownerDomain : shorten(nft.ownership?.owner || "Unknown")}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Mint Address: </span>
                    {shorten(nft.id || "Unknown")}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Mint Authority: </span>
                    {shorten(nft.token_info?.mint_authority || "N/A")}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Update Authority: </span>
                    {shorten(updateAuthority)}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Collection: </span>
                    {shortenLong(nft.grouping?.find(group => group.group_key === 'collection')?.group_value || "N/A")}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">Token Standard: </span>
                    {(nft.content?.metadata?.token_standard || "N/A")}
                  </p>
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
                {nft.content?.metadata?.attributes && nft.content.metadata.attributes.length > 0 && (
                  <>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-2 sm:mt-4">
                      Attributes
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {nft.content.metadata.attributes.map((attribute, index) => (
                        <p key={index} className="text-muted-foreground">
                          <span className="font-semibold">{attribute.trait_type}: </span>
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
