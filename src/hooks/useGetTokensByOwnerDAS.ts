import { useCluster } from "@/providers/cluster-provider";
import { DAS, Interface } from "@/types/helius-sdk";
import { Token } from "@/types/token";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetTokensByOwnerDAS(
  address: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getTokensByOwnerDAS", address],
    queryFn: async () => getTokensByOwnerDAS(address, 1, endpoint),
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

export async function getTokensByOwnerDAS(
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
    if (
      item.interface === Interface.FUNGIBLE_TOKEN &&
      item.token_info?.associated_token_address
    ) {
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

  tokens.sort((a, b) => (b.value || 0) - (a.value || 0));

  return tokens;
}
