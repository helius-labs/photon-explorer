import { useCluster } from "@/providers/cluster-provider";
import { getTokenPrices } from "@/server/getTokenPrice";
import { Token } from "@/types/token";
import { normalizeTokenAmount } from "@/utils/common";
import { createRpc } from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetTokensByOwnerCompressed(
  address: string,
  enabled: boolean = true,
) {
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
      endpoint,
      compressionEndpoint,
      "getTokensByOwnerCompressed",
      address,
    ],
    queryFn: async () =>
      getTokensByOwnerCompressed(address, endpoint, compressionEndpoint),
    enabled,
  });
}

export async function getTokensByOwnerCompressed(
  address: string,
  endpoint: string,
  compressionEndpoint: string,
) {
  const connection = createRpc(endpoint, compressionEndpoint, undefined, {
    commitment: "processed",
  });

  const data = await connection.getCompressedTokenAccountsByOwner(
    new PublicKey(address),
  );

  const tokens: Token[] = data.map((item) => {
    return {
      raw: item,
      pubkey: new PublicKey(item.compressedAccount.hash),
      amount: item.parsed.amount,
      mint: new PublicKey(item.parsed.mint),
      decimals: 9,
    };
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

  return tokens;
}
