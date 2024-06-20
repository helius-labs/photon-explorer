"use client";

import { useCluster } from "@/providers/cluster-provider";
import { FungibleToken, NonFungibleToken } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useSearchAssets(
  address: string,
  page: number,
  limit: number,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isPending, isFetching, refetch } = useQuery({
    queryKey: [endpoint, address, "searchAssets", page, limit],
    queryFn: async (): Promise<{
      fungibleTokens: FungibleToken[];
      nonFungibleTokens: NonFungibleToken[];
      totalItems: number;
      totalPages: number;
    }> => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "searchAssets",
          params: {
            ownerAddress: address,
            tokenType: "all",
            page,
            limit,
            sortBy: { sortBy: "id", sortDirection: "asc" },
            displayOptions: {
              showNativeBalance: true,
              showInscription: true,
              showCollectionMetadata: true,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data`);
      }

      const data = await response.json();
      const items: (FungibleToken | NonFungibleToken)[] = data.result.items;
      const totalItems = data.result.total;
      const totalPages = Math.ceil(totalItems / limit);

      // Split the items into fungible and non-fungible tokens
      let fungibleTokens: FungibleToken[] = items.filter(
        (item): item is FungibleToken =>
          item.interface === "FungibleToken" ||
          item.interface === "FungibleAsset",
      );

      const nonFungibleTokens: NonFungibleToken[] = items.filter(
        (item): item is NonFungibleToken =>
          !["FungibleToken", "FungibleAsset"].includes(item.interface),
      );

      // Calculate SOL balance from lamports
      const solBalance = data.result.nativeBalance.lamports;

      // Create SOL token object
      const solToken = {
        interface: "FungibleAsset",
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
            token_standard: "Native Token",
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
          owner: nonFungibleTokens[0]?.ownership.owner,
        },
        supply: null,
        mutable: true,
        burnt: false,

        token_info: {
          symbol: "SOL",
          balance: solBalance,
          supply: 0,
          decimals: 9,
          token_program: "",
          associated_token_address: "",
          price_info: {
            price_per_token: data.result.nativeBalance.price_per_sol,
            total_price: data.result.nativeBalance.total_price,
            currency: "",
          },
        },
      };

      // Add SOL token to the tokens array
      if (solBalance > 0) {
        fungibleTokens.push(solToken);
      }

      // Sort fungible tokens by their total value in descending order
      fungibleTokens.sort(
        (a, b) =>
          (b.token_info.price_info?.total_price || 0) -
          (a.token_info.price_info?.total_price || 0),
      );

      return { fungibleTokens, nonFungibleTokens, totalItems, totalPages };
    },
    enabled,
  });

  return {
    data,
    isLoading,
    isPending,
    isFetching,
    isError: error,
    refetch,
  };
}
