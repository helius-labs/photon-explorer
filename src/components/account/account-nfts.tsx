"use client";

import metaplexLogo from "@/../public/assets/metaplexLogo.jpg";
import { NFT } from "@/types/nft";
import { formatCurrencyValue } from "@/utils/numbers";
import { isLikelySpam } from "@/utils/spam-detection/spamDetection";
import { ColumnDef } from "@tanstack/react-table";
import { CircleHelp } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useGetNFTsByOwner } from "@/hooks/useGetNFTsByOwner";

import AccountNFTsModal from "@/components/account/account-nfts-modal";
import { NFTGridTable } from "@/components/data-table/data-table-nft-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { NFTMedia } from "../common/nft-media";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";

const AccountNFTs = ({ address }: { address: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collectionFilter, setCollectionFilter] = useState<string | undefined>(
    undefined,
  );

  const [showMetaplexVerified, setShowMetaplexVerified] = useState(false);
  const [showCompressed] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [filterSpam, setFilterSpam] = useState(true);
  const [spamFilteredNfts, setSpamFilteredNfts] = useState<NFT[]>([]);

  const { data: nfts, isLoading, isError } = useGetNFTsByOwner(address);

  useEffect(() => {
    const applySpamFilter = async () => {
      if (!nfts) return;

      const filtered = filterSpam
        ? await Promise.all(
            nfts.map(async (nft) => {
              const isSpam = await isLikelySpam(nft);
              return isSpam ? null : nft;
            }),
          )
        : nfts;
      setSpamFilteredNfts(filtered.filter((nft): nft is NFT => nft !== null));
    };

    applySpamFilter();
  }, [nfts, filterSpam]);

  useEffect(() => {
    const applySpamFilter = async () => {
      if (!nfts) return;

      const filtered = filterSpam
        ? await Promise.all(
            nfts.map(async (nft) => {
              const isSpam = await isLikelySpam(nft);
              return isSpam ? null : nft;
            }),
          )
        : nfts;
      const nonSpamNfts = filtered.filter((nft): nft is NFT => nft !== null);
      setSpamFilteredNfts(nonSpamNfts);

      const collectionSet = new Set<string>();
      nonSpamNfts.forEach((nft) => {
        if (nft.collectionName) {
          collectionSet.add(nft.collectionName);
        }
      });

      const sortedCollections = Array.from(collectionSet).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      );

      setCollections(["All Collections", ...sortedCollections]);
    };

    applySpamFilter();
  }, [nfts, filterSpam]);

  const filteredCollections = useMemo(() => {
    if (!showMetaplexVerified) return collections;
    return collections.filter(
      (collection) =>
        collection === "All Collections" ||
        spamFilteredNfts.some(
          (nft) => nft.collectionName === collection && nft.verified,
        ),
    );
  }, [collections, spamFilteredNfts, showMetaplexVerified]);

  useEffect(() => {
    const currentCollection = searchParams.get("collection");

    if (currentCollection && filteredCollections.includes(currentCollection)) {
      setCollectionFilter(currentCollection);
    } else {
      setCollectionFilter("All Collections");
      handleNoFilter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, filteredCollections]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(name, value);
    return params.toString();
  };

  const handleNoFilter = useCallback(() => {
    setCollectionFilter(undefined);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("collection");
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }, [pathname, router, searchParams]);

  const handleCollectionFilter = useCallback(
    (collection: string) => {
      if (collection === "All Collections") {
        handleNoFilter();
      } else {
        setCollectionFilter(collection);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("collection", collection);
        router.push(`${pathname}?${newSearchParams.toString()}`);
      }
    },
    [handleNoFilter, pathname, router, searchParams],
  );

  const handleVerifiedToggle = useCallback(() => {
    setShowMetaplexVerified((prev) => {
      const newValue = !prev;
      if (
        newValue &&
        collectionFilter &&
        collectionFilter !== "All Collections"
      ) {
        const hasVerifiedNFTs = spamFilteredNfts.some(
          (nft) => nft.collectionName === collectionFilter && nft.verified,
        );
        if (!hasVerifiedNFTs) {
          handleNoFilter();
        }
      }
      return newValue;
    });
  }, [collectionFilter, spamFilteredNfts, handleNoFilter]);

  const handleQuickViewClick = useCallback((nftData: NFT) => {
    setSelectedNft(nftData);
    setIsModalOpen(true);
  }, []);

  const filteredNfts = useMemo(() => {
    return spamFilteredNfts.filter((nft) => {
      const matchesVerified = !showMetaplexVerified || nft.verified;
      const matchesCollection =
        !collectionFilter || nft.collectionName === collectionFilter;
      const matchesCompressed =
        !showCompressed || (nft.compression && nft.compression.compressed);
      return matchesVerified && matchesCollection && matchesCompressed;
    });
  }, [
    spamFilteredNfts,
    showMetaplexVerified,
    collectionFilter,
    showCompressed,
  ]);

  const handleSpamFilterToggle = useCallback(() => {
    setFilterSpam((prev) => !prev);
  }, []);

  const columns: ColumnDef<NFT>[] = useMemo(
    () => [
      {
        header: "Media",
        accessorKey: "image",
        cell: ({ getValue, row }) => {
          return (
            <div className="group relative">
              <NFTMedia
                nft={row.original}
                className="rounded-md object-contain"
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
    ],
    [handleQuickViewClick],
  );

  if (isError)
    return (
      <Card className="col-span-12 mx-[-1rem] mb-10 shadow md:mx-0">
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
      <Card className="col-span-12 mx-[-1rem] mb-10 overflow-hidden shadow md:mx-0">
        <CardContent className="flex flex-col gap-4 pb-4 pt-6">
          {isLoading ? (
            <div>
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0 md:pb-8">
                <div className="flex flex-col font-medium md:flex-grow">
                  <Skeleton className="h-6 w-32" /> {/* Total NFTs */}
                </div>
                <div className="flex flex-col space-y-4 pb-8 md:ml-auto md:flex-row md:items-center md:space-x-4 md:space-y-0 md:pb-0">
                  <Skeleton className="h-8 w-40" /> {/* Verified Badge */}
                  <Skeleton className="h-8 w-full md:w-44" />{" "}
                  {/* All Collections */}
                </div>
              </div>

              {/* Adjusting grid for mobile */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {Array.from({ length: 20 }).map((_, index) => (
                  <Card key={index} className="shadow">
                    <Skeleton className="h-48 w-full rounded-md" />{" "}
                    {/* Image */}
                    <CardContent>
                      <Skeleton className="mt-4 h-6 w-full pb-2" /> {/* Name */}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Skeleton */}
              <div className="mt-4 flex flex-col items-center justify-between px-4 py-4 sm:flex-row">
                <div className="mb-4 flex items-center sm:mb-0">
                  <Skeleton className="h-6 w-20" /> {/* Rows per page text */}
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-6 w-12" /> {/* Page indicator */}
                  <Skeleton className="h-8 w-8 rounded-full" />{" "}
                  {/* Left double arrow */}
                  <Skeleton className="h-8 w-8 rounded-full" />{" "}
                  {/* Left single arrow */}
                  <Skeleton className="h-8 w-8 rounded-full" />{" "}
                  {/* Right single arrow */}
                  <Skeleton className="h-8 w-8 rounded-full" />{" "}
                  {/* Right double arrow */}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col justify-between text-xs sm:flex-row sm:items-center sm:text-sm">
                <div className="flex flex-col font-medium sm:flex-row sm:space-x-4">
                  <span>Total NFTs: {filteredNfts.length}</span>
                </div>
                <div className="flex flex-col space-y-4 sm:mt-0 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                  <div className="flex cursor-pointer items-center space-x-2">
                    <Badge
                      className="mt-3 flex items-center space-x-2 md:mt-0"
                      variant="outline"
                    >
                      Filter Out Spam
                      <Popover>
                        <PopoverTrigger asChild>
                          <CircleHelp className="ml-1 h-4 w-4 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="text-center">
                          Filter out NFTs that are likely to be spam
                        </PopoverContent>
                      </Popover>
                      <Switch
                        checked={filterSpam}
                        onCheckedChange={handleSpamFilterToggle}
                        className="ml-2"
                        checkedClassName="bg-purple-600 opacity-90"
                        uncheckedClassName="bg-gray-400"
                        style={{ transform: "scale(0.85)" }}
                      />
                    </Badge>
                    <Badge
                      className="mt-3 flex items-center space-x-2 md:mt-0"
                      variant="verified"
                    >
                      Verified
                      <Image
                        src={metaplexLogo}
                        alt="Metaplex Logo"
                        width={16}
                        height={16}
                        className="ml-2 rounded-full"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <CircleHelp className="ml-1 h-4 w-4 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent>
                          Filter your response by Metaplex Verified NFTs
                        </PopoverContent>
                      </Popover>
                      <Switch
                        checked={showMetaplexVerified}
                        onCheckedChange={handleVerifiedToggle}
                        className="ml-2"
                        checkedClassName="bg-purple-600 opacity-90"
                        uncheckedClassName="bg-gray-400"
                        style={{ transform: "scale(0.85)" }}
                      />
                    </Badge>
                  </div>
                  <Select
                    value={collectionFilter || "All Collections"}
                    onValueChange={handleCollectionFilter}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by Collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCollections.map((collection) => (
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
  );
};

export default AccountNFTs;
