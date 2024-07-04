import { useCluster } from "@/providers/cluster-provider";
import { getTokenPrices } from "@/server/getTokenPrice";
import { Token } from "@/types/token";
import { normalizeTokenAmount } from "@/utils/common";
import {
  TokenStandard,
  fetchAllDigitalAssetWithTokenByOwner,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey, unwrapOption } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetTokensByOwnerMetaplex(
  address: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getTokensByOwnerMetaplex", address],
    queryFn: async () => getTokensByOwnerMetaplex(address, endpoint),
    enabled,
  });
}

export async function getTokensByOwnerMetaplex(
  address: string,
  endpoint: string,
) {
  const umi = createUmi(endpoint).use(mplTokenMetadata());

  // Fetch symbols and logos for tokens
  const assets = await fetchAllDigitalAssetWithTokenByOwner(
    umi,
    publicKey(address),
    {
      tokenStrategy: "getProgramAccounts",
    },
  );

  const tokens: Token[] = assets.flatMap((item) => {
    if (
      unwrapOption(item.metadata.tokenStandard) === TokenStandard.NonFungible
    ) {
      return {
        raw: item,
        pubkey: new PublicKey(item.publicKey),
        mint: new PublicKey(item.mint.publicKey),
        amount: Number(item.token.amount),
        decimals: item.mint.decimals,
        name: item.metadata.name,
        symbol: item.metadata.symbol,
        logoURI: item.metadata.uri,
      };
    }
    return [];
  });

  // Fetch prices for tokens
  const tokenPrices = await getTokenPrices(
    tokens.map((t) => t.mint.toBase58()),
  );
  if (tokenPrices) {
    tokens.forEach((t) => {
      const tokenPrice = tokenPrices.data[t.mint.toBase58()];
      if (tokenPrice) {
        t.price = tokenPrice.price;

        if (t.decimals && t.decimals) {
          t.value = normalizeTokenAmount(t.amount, t.decimals) * t.price;
        }
      }
    });
  }

  tokens.sort((a, b) => b.value! - a.value!);

  return tokens;
}
