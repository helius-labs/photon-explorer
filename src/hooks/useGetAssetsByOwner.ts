"use client";

import { useCluster } from "@/providers/cluster-provider";
import { Interface, OwnershipModel, RoyaltyModel } from "@/types/helius-sdk";
import { DAS } from "@/types/helius-sdk/das-types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

type AssetResponse = {
  result: DAS.GetAssetResponseList & {
    nativeBalance?: {
      lamports: number;
      price_per_sol: string | number;
      total_price: string | number;
    };
  };
};

export function useGetAssetsByOwner(address: string, enabled: boolean = true) {
  const { endpoint } = useCluster();
  const [allAssets, setAllAssets] = useState<DAS.GetAssetResponse[]>([]);
  const [page, setPage] = useState(1);
  const [isFetchingAll, setIsFetchingAll] = useState(true);

  const fetchAssets = async (page: number) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: address,
          page,
          sortBy: {
            sortBy: "created",
            sortDirection: "asc",
          },
          displayOptions: {
            showUnverifiedCollections: true,
            showCollectionMetadata: true,
            showGrandTotal: true,
            showFungible: true,
            showNativeBalance: true,
            showInscription: true,
            showZeroBalance: true,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data`);
    }

    const data: AssetResponse = await response.json();
    return data.result;
  };

  const saveToLocalStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const loadFromLocalStorage = (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  };

  const queryOptions: UseQueryOptions<AssetResponse["result"]> = {
    queryKey: ["getAssetsByOwner", address, page],
    queryFn: async () => {
      const cachedData = loadFromLocalStorage(`assets-${address}-${page}`);
      if (cachedData) {
        return cachedData;
      }
      const result = await fetchAssets(page);
      saveToLocalStorage(`assets-${address}-${page}`, result);
      return result;
    },
    enabled,
  };

  const { refetch, data, isLoading, isError } = useQuery(queryOptions);

  useEffect(() => {
    if (data?.items) {
      setAllAssets((prev) => [...prev, ...data.items]);
      if (data.items.length === 100) {
        setPage((prev) => prev + 1);
      } else {
        setIsFetchingAll(false);
      }
    }
  }, [data]);

  useEffect(() => {
    if (isFetchingAll) {
      refetch();
    }
  }, [page, isFetchingAll, refetch]);

  const solToken = useMemo(() => {
    if (data?.nativeBalance) {
      return {
        interface: Interface.FUNGIBLE_TOKEN,
        id: "So11111111111111111111111111111111111111112",
        content: {
          $schema: "https://schema.metaplex.com/nft1.0.json",
          json_uri: "",
          files: [
            {
              uri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
              cdn_uri: "",
              mime: "image/png",
              [Symbol.iterator]: function* (): Iterator<DAS.File> {
                yield this;
              },
            },
          ],
          metadata: {
            description: "Solana Token",
            name: "Wrapped SOL",
            symbol: "SOL",
            attributes: [],
          },
          links: {
            image:
              "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
            [Symbol.iterator]: function* () {
              yield this;
            },
          },
        },
        authorities: [],
        compression: {
          eligible: false,
          compressed: false,
          data_hash: "",
          creator_hash: "",
          asset_hash: "",
          tree: "",
          seq: 0,
          leaf_id: 0,
        },
        grouping: [],
        royalty: {
          royalty_model: RoyaltyModel.FANOUT,
          target: undefined,
          percent: 0,
          basis_points: 0,
          primary_sale_happened: false,
          locked: false,
        },
        creators: [],
        ownership: {
          frozen: false,
          delegated: false,
          delegate: undefined,
          ownership_model: OwnershipModel.TOKEN,
          owner: "",
        },
        supply: undefined,
        mutable: true,
        burnt: false,
        token_info: {
          symbol: "SOL",
          balance: data.nativeBalance.lamports,
          supply: 0,
          decimals: 9,
          token_program: "",
          associated_token_address: "",
          price_info: {
            price_per_token: parseFloat(
              data.nativeBalance.price_per_sol?.toString(),
            ),
            total_price: parseFloat(data.nativeBalance.total_price?.toString()),
            currency: "",
          },
        },
      };
    }
    return null;
  }, [data?.nativeBalance]);

  const sortedFungibleTokens = useMemo(() => {
    const tokens = solToken ? [solToken, ...allAssets] : allAssets;

    return tokens
      .filter(
        (item): item is DAS.GetAssetResponse =>
          item.interface === Interface.FUNGIBLE_TOKEN ||
          item.interface === Interface.FUNGIBLE_ASSET,
      )
      .sort((a, b) => {
        const aBalance = a.token_info?.balance || 0;
        const aPrice =
          typeof a.token_info?.price_info?.price_per_token === "string"
            ? parseFloat(a.token_info?.price_info?.price_per_token)
            : a.token_info?.price_info?.price_per_token || 0;
        const aTotalValue =
          (aBalance / Math.pow(10, a.token_info?.decimals || 0)) * aPrice;

        const bBalance = b.token_info?.balance || 0;
        const bPrice =
          typeof b.token_info?.price_info?.price_per_token === "string"
            ? parseFloat(b.token_info?.price_info?.price_per_token)
            : b.token_info?.price_info?.price_per_token || 0;
        const bTotalValue =
          (bBalance / Math.pow(10, b.token_info?.decimals || 0)) * bPrice;

        return bTotalValue - aTotalValue;
      });
  }, [allAssets, solToken]);

  const grandTotal = sortedFungibleTokens.reduce((total, item) => {
    const balance = item.token_info?.balance || 0;
    const price =
      typeof item.token_info?.price_info?.price_per_token === "string"
        ? parseFloat(item.token_info?.price_info?.price_per_token)
        : item.token_info?.price_info?.price_per_token || 0;
    return (
      total + (balance / Math.pow(10, item.token_info?.decimals || 0)) * price
    );
  }, 0);

  return {
    fungibleTokens: sortedFungibleTokens,
    nonFungibleTokens: allAssets.filter(
      (item): item is DAS.GetAssetResponse =>
        ![Interface.FUNGIBLE_TOKEN, Interface.FUNGIBLE_ASSET].includes(
          item.interface,
        ),
    ),
    totalItems: allAssets.length,
    totalPages: Math.ceil(allAssets.length / 100),
    grandTotal,
    isLoading,
    isError,
    refetch,
  };
}
