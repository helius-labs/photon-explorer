"use client";

import noImg from "@/../public/assets/noimg.svg";
import { NFT } from "@/types/nft";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useState } from "react";

import { useGetNFTsByOwner } from "@/hooks/useGetNFTsByOwner";

import AccountNFTsModal from "@/components/account/account-nfts-modal";
import { NFTGridTable } from "@/components/data-table/data-table-nft-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const AccountNFTs = ({ address }: { address: string }) => {
  const [showNonVerified, setShowNonVerified] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError } = useGetNFTsByOwner(address);

  const displayedNfts =
    data?.filter((nft) => nft.verified !== showNonVerified) || [];

  // Calculate total value of NFTs
  const total =
    displayedNfts?.reduce((accumulator, token) => {
      return accumulator + (token.value || 0);
    }, 0) || 0;

  const handleQuickViewClick = (nftData: NFT) => {
    setSelectedNft(nftData);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<NFT>[] = [
    {
      header: "Image",
      accessorKey: "content.links.image",
      cell: ({ getValue, row }) => {
        const imageUrl = getValue<string>() || noImg.src;
        return (
          <div className="group relative">
            <Image
              src={imageUrl}
              alt="NFT"
              className="h-40 w-full rounded-md object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                onClick={() => handleQuickViewClick(row.original)}
                className="text-white"
              >
                Quick View
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      header: "Name",
      accessorKey: "content.metadata.name",
    },
    {
      header: "Price (SOL)",
      accessorKey: "token_info.price_info.price_per_token",
      cell: ({ getValue }) => {
        const price = getValue<number>();
        return price ? price.toFixed(2) : "N/A";
      },
    },
  ];

  if (isError)
    return (
      <Card className="col-span-12 mb-10 shadow">
        <CardContent className="flex flex-col items-center gap-4 pb-6 pt-6">
          <div className="font-semibold text-secondary">
            Unable to fetch NFTs
          </div>
          <div className="text-gray-500">
            <button
              onClick={() => window.location.reload()}
              className="text-blue-500 underline"
            >
              Refresh
            </button>{" "}
            or change networks.
          </div>
        </CardContent>
      </Card>
    );

  return (
    <>
      <Card className="col-span-12 mb-10 shadow">
        <CardContent className="flex flex-col gap-4 pb-4 pt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              {[...Array(12)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="mt-14 h-60 w-full rounded-md md:h-40"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col justify-between text-xs sm:flex-row sm:items-center sm:text-sm">
                <div className="flex flex-col font-medium sm:flex-row sm:space-x-4">
                  <span>Total NFTs: {displayedNfts.length}</span>
                  <span>Total Floor Value: {total.toFixed(2)} SOL</span>
                </div>
                <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                  <Label className="text-xs sm:text-sm">
                    Show Non-Verified Collections
                  </Label>
                  <Switch
                    checked={showNonVerified}
                    onCheckedChange={() => setShowNonVerified((prev) => !prev)}
                  />
                </div>
              </div>
              {displayedNfts.length > 0 ? (
                <NFTGridTable
                  columns={columns}
                  data={displayedNfts}
                  onQuickView={handleQuickViewClick} // Ensure this prop is passed
                />
              ) : (
                <p className="flex items-center justify-center p-6 text-lg text-muted-foreground">
                  No NFTs found
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <AccountNFTsModal
        nft={selectedNft}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default AccountNFTs;
