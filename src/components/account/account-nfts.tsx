"use client";

import noLogoImg from "@/../public/assets/noLogoImg.svg";
import { NFT } from "@/types/nft";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { useGetNFTsByOwner } from "@/hooks/useGetNFTsByOwner";

import AccountNFTsModal from "@/components/account/account-nfts-modal";
import { NFTGridTable } from "@/components/data-table/data-table-nft-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AccountNFTs = ({ address }: { address: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const collectionFilter = searchParams.get("collection");

  const [showNonVerified, setShowNonVerified] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);

  const { data, isLoading, isError } = useGetNFTsByOwner(address);

  useEffect(() => {
    // Extract unique collection values from nftDataArray
    const collectionSet = new Set<string>();
    data?.forEach((nft) => {
      if (nft.collectionName) {
        collectionSet.add(nft.collectionName);
      }
    });
    setCollections(Array.from(collectionSet));
  }, [data]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handleCollectionFilter = (collection: string) => {
    const queryString = createQueryString("collection", collection);
    router.push(`${pathname}?${queryString}`);
  };

  const handleNoFilter = () => {
    // Create a new instance of URLSearchParams
    const newSearchParams = new URLSearchParams(searchParams);
    // Delete the 'collection' parameter
    newSearchParams.delete("collection");

    // Navigate to the updated URL
    const newURL = `${pathname}?${newSearchParams.toString()}`;
    router.push(newURL);
  };

  const handleQuickViewClick = (nftData: NFT) => {
    setSelectedNft(nftData);
    setIsModalOpen(true);
  };

  const filteredNfts = useMemo(() => {
    return (
      data?.filter((nft) => {
        const matchesVerified = nft.verified || showNonVerified;
        const matchesCollection = collectionFilter ? nft.collectionName === collectionFilter : true;
        return matchesVerified && matchesCollection;
      }) || []
    );
  }, [data, showNonVerified, collectionFilter]);

  const columns: ColumnDef<NFT>[] = [
    {
      header: "Image",
      accessorKey: "image",
      cell: ({ getValue, row }) => {
        const imageUrl = getValue<string>() || noLogoImg.src;
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
      accessorKey: "name",
    },
    {
      header: "Price (SOL)",
      accessorKey: "value",
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
                  <span>Total NFTs: {filteredNfts.length}</span>
                </div>
                <div className="mt-2 flex items-center space-x-4 sm:mt-0">
                  <Select
                    value={collectionFilter || "all"}
                    onValueChange={(value) =>
                      value === "all" ? handleNoFilter() : handleCollectionFilter(value)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by Collection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Collections</SelectItem>
                      {collections.map((collection) => (
                        <SelectItem key={collection} value={collection}>
                          {collection}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs sm:text-sm ml-4">
                      {showNonVerified ? "Spam ON" : "Spam OFF"}
                    </Label>
                    <Switch
                      checked={showNonVerified}
                      onCheckedChange={() => setShowNonVerified((prev) => !prev)}
                    />
                  </div>
                </div>
              </div>
              {filteredNfts.length > 0 ? (
                <NFTGridTable
                  columns={columns}
                  data={filteredNfts}
                  onQuickView={handleQuickViewClick}
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
