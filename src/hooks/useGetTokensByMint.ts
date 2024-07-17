import { useCluster } from "@/providers/cluster-provider";
import { getTokenPrices } from "@/server/getTokenPrice";
import { DAS, Interface } from "@/types/helius-sdk";
import { Token } from "@/types/token";
import { Cluster } from "@/utils/cluster";
import { normalizeTokenAmount } from "@/utils/common";
import { createRpc } from "@lightprotocol/stateless.js";
import {
  TokenStandard,
  fetchAllDigitalAssetWithTokenByOwner,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey, unwrapOption } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetTokensByMint(mint: string, enabled: boolean = true) {
  const { cluster, endpoint } = useCluster();

  return useQuery<Token | null>({
    queryKey: [cluster, endpoint, "getTokensByMint", mint],
    queryFn: async () => {
      let token: Token | null = null;

      if ([Cluster.MainnetBeta, Cluster.Devnet].includes(cluster)) {
        token = await getTokenByMintDAS(mint, endpoint);
      } else {
        token = await getTokenByMintMetaplex(mint, endpoint);
      }

      return token;
    },
    enabled,
  });
}

async function getTokenByMintDAS(
  mint: string,
  endpoint: string,
): Promise<Token | null> {
  try {
    console.log("Fetching token data from DAS API...");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getAsset",
        params: {
          id: mint,
          options: {
            showFungible: true,
          },
        },
      }),
    });

    const data: { result: DAS.GetAssetResponse } = await response.json();
    console.log("DAS API Response:", data);

    const item = data.result;
    console.log("DAS API Item:", item);

    if (item && item.interface === Interface.FUNGIBLE_TOKEN) {
      return {
        raw: item,
        pubkey: new PublicKey(item.id), // Using the mint address directly
        name: item.content?.metadata?.name || "N/A",
        symbol: item.token_info?.symbol || "N/A",
        logoURI: item.content?.links?.image || undefined,
        amount: item.token_info?.balance || 0,
        decimals: item.token_info?.decimals || 0,
        value: item.token_info?.price_info?.total_price || 0,
        price: item.token_info?.price_info?.price_per_token || 0,
        mint: new PublicKey(item.id),
        supply: item.token_info?.supply || 0,
        mint_authority: item.token_info?.mint_authority || "N/A",
        freeze_authority: item.token_info?.freeze_authority || "N/A",
        token_program: item.token_info?.token_program || "N/A",
      };
    }
  } catch (error) {
    console.error("Error fetching token data from DAS API:", error);
  }
  return null;
}

async function getTokenByMintMetaplex(
  mint: string,
  endpoint: string,
): Promise<Token | null> {
  console.log("Fetching token data from Metaplex API...");
  const umi = createUmi(endpoint).use(mplTokenMetadata());

  const asset = await fetchAllDigitalAssetWithTokenByOwner(
    umi,
    publicKey(mint),
    {
      tokenStrategy: "getProgramAccounts",
    },
  );

  const item = asset[0];
  console.log("Metaplex API Response:", item);

  if (item) {
    const tokenStandard = unwrapOption(item.metadata.tokenStandard);

    if (
      tokenStandard &&
      [TokenStandard.Fungible, TokenStandard.FungibleAsset].includes(
        tokenStandard,
      )
    ) {
      const token: Token = {
        raw: item,
        pubkey: new PublicKey(item.publicKey),
        mint: new PublicKey(item.mint.publicKey),
        amount: Number(item.token.amount),
        decimals: item.mint.decimals,
        name: item.metadata.name,
        symbol: item.metadata.symbol,
        logoURI: undefined,
      };

      const tokenPrices = await getTokenPrices([token.mint.toBase58()]);
      if (tokenPrices) {
        const tokenPrice = tokenPrices.data[token.mint.toBase58()];
        if (tokenPrice) {
          token.price = tokenPrice.price;

          if (token.decimals && token.decimals) {
            token.value =
              normalizeTokenAmount(token.amount, token.decimals) * token.price;
          }
        }
      }

      await fetchTokenMetadata([token]);

      return token;
    }
  }
  return null;
}

const fetchTokenMetadata = async (tokens: Token[]) => {
  const fetchMetadata = async (token: Token) => {
    if (token.raw.metadata.uri) {
      try {
        const response = await fetch(token.raw.metadata.uri);
        const externalMetadata = await response.json();
        token.logoURI = externalMetadata.image;
      } catch (error) {
        // Ignore errors and continue
      }
    }
  };

  await Promise.all(tokens.map(fetchMetadata));
};
