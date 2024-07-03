import { useCluster } from "@/providers/cluster-provider";
import { DAS } from "@/types/helius-sdk/das-types";
import { Token } from "@/types/token";
import { Cluster } from "@/utils/cluster";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import { getAccountTokens } from "./useGetAccountTokens";

export function useGetTokens(address: string, enabled: boolean = true) {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getTokens", address],
    queryFn: async () => {
      // Use Helius DAS API for Mainnet and Devnet
      if ([Cluster.MainnetBeta, Cluster.Devnet].includes(cluster)) {
        return getTokensByOwner(address, 1, endpoint);
      } else {
        return getAccountTokens(address, cluster, endpoint);
      }
    },
    enabled,
  });
}

type AssetResponse = {
  result: DAS.GetAssetResponseList & {
    nativeBalance?: {
      lamports: number;
      price_per_sol: string | number;
      total_price: string | number;
    };
  };
};

async function getTokensByOwner(
  address: string,
  page: number = 1,
  endpoint: string,
) {
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
          showFungible: true,
          showUnverifiedCollections: false,
          showCollectionMetadata: false,
          showNativeBalance: false,
          showInscription: false,
          showGrandTotal: false,
          showZeroBalance: false,
        },
      },
    }),
  });

  const data: AssetResponse = await response.json();

  const tokens: Token[] = data.result.items.flatMap((item) => {
    if (item.token_info?.associated_token_address) {
      return {
        raw: item,
        pubkey: new PublicKey(item.token_info?.associated_token_address),
        name: item.content?.metadata?.name,
        symbol: item.token_info?.symbol,
        logoURI: item.content?.links?.image,
        amount: item.token_info?.balance || 0,
        decimals: item.token_info?.decimals || 0,
        value: item.token_info?.price_info?.total_price,
        price: item.token_info?.price_info?.price_per_token,
        mint: new PublicKey(item.id),
      };
    }
    return [];
  });

  tokens.sort((a, b) => b.value! - a.value!);

  return tokens;
}
