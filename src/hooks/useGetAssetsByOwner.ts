"use client";

import { useCluster } from "@/providers/cluster-provider";
import { FungibleToken, NonFungibleToken } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type AssetResponse = {
  result: {
    items: (FungibleToken | NonFungibleToken)[];
    total: number;
    grandTotal: number;
    nativeBalance?: {
      lamports: number;
      price_per_sol: number;
      total_price: number;
    };
  };
};

export function useGetAssetsByOwner(address: string, enabled: boolean = true) {
  const { endpoint } = useCluster();
  const [allAssets, setAllAssets] = useState<
    (FungibleToken | NonFungibleToken)[]
  >([]);
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
          options: {
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

  const sortedFungibleTokens = allAssets
    .filter(
      (item): item is FungibleToken =>
        item.interface === "FungibleToken" ||
        item.interface === "FungibleAsset",
    )
    .sort(
      (a, b) =>
        (b.token_info?.price_info?.total_price || 0) -
        (a.token_info?.price_info?.total_price || 0),
    );

  const sortedNonFungibleTokens = allAssets.filter(
    (item): item is NonFungibleToken =>
      !["FungibleToken", "FungibleAsset"].includes(item.interface),
  );

  const grandTotal = sortedFungibleTokens.reduce(
    (total, item) => total + (item.token_info?.price_info?.total_price || 0),
    0,
  );

  // Create SOL token object if nativeBalance is present
  if (data?.nativeBalance) {
    const solToken: FungibleToken = {
      interface: "FungibleToken",
      id: "So11111111111111111111111111111111111111112",
      content: {
        $schema: "https://schema.metaplex.com/nft1.0.json",
        json_uri: "",
        files: [
          {
            uri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
            cdn_uri: "",
            mime: "image/png",
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
        royalty_model: "",
        target: null,
        percent: 0,
        basis_points: 0,
        primary_sale_happened: false,
        locked: false,
      },
      creators: [],
      ownership: {
        frozen: false,
        delegated: false,
        delegate: null,
        ownership_model: "token",
        owner: "",
      },
      supply: null,
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
          price_per_token: data.nativeBalance.price_per_sol,
          total_price: data.nativeBalance.total_price,
          currency: "",
        },
      },
    };
    // Add SOL token to the beginning of the sortedFungibleTokens array
    sortedFungibleTokens.unshift(solToken);
  }

  return {
    fungibleTokens: sortedFungibleTokens,
    nonFungibleTokens: sortedNonFungibleTokens,
    totalItems: allAssets.length,
    totalPages: Math.ceil(allAssets.length / 100),
    grandTotal,
    isLoading,
    isError,
    refetch,
  };
}
