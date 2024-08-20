"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetNFTsByOwner } from "@/hooks/useGetNFTsByOwner";
import { NFT } from "@/types/nft";
import { NFTMedia } from '../common/nft-media';
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AccountNFTsModal from "@/components/account/account-nfts-modal";
import { NFTGridTable } from "@/components/data-table/data-table-nft-grid";
import Image from 'next/image';
import metaplexLogo from "@/../public/assets/metaplexLogo.jpg";
import { CircleHelp } from "lucide-react";
import { Switch } from '../ui/switch';
import { formatCurrencyValue } from '@/utils/numbers';
import { Skeleton } from '../ui/skeleton';

const AccountNFTs = ({ address }: { address: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const collectionFilter = searchParams.get("collection");

  const [showMetaplexVerified, setShowMetaplexVerified] = useState(false);
  const [showCompressed] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);

  const { data: nfts, isLoading, isError } = useGetNFTsByOwner(address);

  useEffect(() => {
    if (nfts) {
      const collectionSet = new Set<string>();
      nfts.forEach((nft) => {
        if (nft.collectionName) {
          collectionSet.add(nft.collectionName);
        }
      });
      setCollections(Array.from(collectionSet));
    }
  }, [nfts]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(name, value);
    return params.toString();
  };

  const handleCollectionFilter = useCallback((collection: string) => {
    const queryString = createQueryString("collection", collection);
    router.push(`${pathname}?${queryString}`);
  }, [createQueryString, pathname, router]);

  const handleNoFilter = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("collection");
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }, [pathname, router, searchParams]);

  const handleQuickViewClick = useCallback((nftData: NFT) => {
    setSelectedNft(nftData);
    setIsModalOpen(true);
  }, []);

  const filteredNfts = useMemo(() => {
    return (
      nfts?.filter((nft) => {
        const matchesVerified = showMetaplexVerified ? nft.verified : true;
        const matchesCollection = collectionFilter
          ? nft.collectionName === collectionFilter
          : true;
        const matchesCompressed =
          !showCompressed || (nft.compression && nft.compression.compressed);
        return matchesVerified && matchesCollection && matchesCompressed;
      }) || []
    );
  }, [nfts, showMetaplexVerified, collectionFilter, showCompressed]);

  const columns: ColumnDef<NFT>[] = useMemo(() => [
    {
      header: "Media",
      accessorKey: "image",
      cell: ({ getValue, row }) => {
        return (
          <div className="group relative">
            <NFTMedia
              nft={row.original}
              className="object-contain rounded-md"
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
        return price ? formatCurrencyValue(price) : "N/A";
      },
    },
  ], [handleQuickViewClick]);

  if (isError)
    return (
      <Card className="col-span-12 mb-10 shadow mx-[-1rem] md:mx-0">
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
    (
      <>
        <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
          <CardContent className="flex flex-col gap-4 pb-4 pt-6">
          {isLoading ? (
  <div>
<div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:pb-8 md:space-x-4 md:items-center">
  <div className="flex flex-col font-medium md:flex-grow">
    <Skeleton className="h-6 w-32" /> {/* Total NFTs */}
  </div>
  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center md:ml-auto pb-8 md:pb-0">
    <Skeleton className="h-8 w-40" /> {/* Verified Badge */}
    <Skeleton className="h-8 w-full md:w-44" /> {/* All Collections */}
  </div>
</div>



    
    {/* Adjusting grid for mobile */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      {Array.from({ length: 20 }).map((_, index) => (
        <Card key={index} className="shadow">
          <Skeleton className="h-48 w-full rounded-md" /> {/* Image */}
          <CardContent>
            <Skeleton className="h-6 w-full pb-2 mt-4" /> {/* Name */}
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Pagination Skeleton */}
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 mt-4">
      <div className="flex items-center mb-4 sm:mb-0">
        <Skeleton className="h-6 w-20" /> {/* Rows per page text */}
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-6 w-12" /> {/* Page indicator */}
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Left double arrow */}
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Left single arrow */}
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Right single arrow */}
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Right double arrow */}
      </div>
    </div>
  </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col justify-between text-xs sm:flex-row sm:items-center sm:text-sm">
                <div className="flex flex-col font-medium sm:flex-row sm:space-x-4">
                  <span>Total NFTs: {filteredNfts.length}</span>
                </div>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-4 sm:mt-0">
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <Badge className="flex items-center space-x-2 mt-3 md:mt-0" variant="verified">
                      Verified
                      <Image
                        src={metaplexLogo}
                        alt="Metaplex Logo"
                        width={16}
                        height={16}
                        className="rounded-full ml-2"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <CircleHelp className="w-4 h-4 ml-1 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent>
                          Filter your response by Metaplex Verified NFTs
                        </PopoverContent>
                      </Popover>
                      <Switch
                        checked={showMetaplexVerified}
                        onCheckedChange={() =>
                          setShowMetaplexVerified((prev) => !prev)
                        }
                        className="ml-2"
                        checkedClassName="bg-purple-600 opacity-90"
                        uncheckedClassName="bg-gray-400"
                        style={{ transform: "scale(0.85)" }}
                      />
                    </Badge>
                  </div>
                  <Select
                    value={collectionFilter || "all"}
                    onValueChange={(value) =>
                      value === "all"
                        ? handleNoFilter()
                        : handleCollectionFilter(value)
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
  ));
};

export default AccountNFTs;
