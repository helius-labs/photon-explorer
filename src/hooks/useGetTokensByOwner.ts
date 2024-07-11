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

export function useGetTokensByOwner(address: string, enabled: boolean = true) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getTokensByOwner", address],
    queryFn: async () => {
      let tokens: Token[] = [];

      if ([Cluster.MainnetBeta, Cluster.Devnet].includes(cluster)) {
        // Use Helius DAS API for Mainnet and Devnet
        tokens = await getTokensByOwnerDAS(address, 1, endpoint);
      } else {
        // Use Metaplex for custom, localnet and testnet
        tokens = await getTokensByOwnerMetaplex(address, endpoint);
      }

      // Compressed tokens are not supported on mainnet and devnet
      // Once they are supported, we can remove this conditional
      if (
        [Cluster.Custom, Cluster.Localnet, Cluster.Testnet].includes(cluster)
      ) {
        const compressed = await getTokensByOwnerCompressed(
          address,
          endpoint,
          compressionEndpoint,
        );

        tokens = tokens.concat(compressed);
      }

      tokens.sort((a, b) => (b.value || 0) - (a.value || 0));

      return tokens;
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

async function getTokensByOwnerDAS(
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

  return tokens;
}

async function getTokensByOwnerMetaplex(address: string, endpoint: string) {
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
    const tokenStandard = unwrapOption(item.metadata.tokenStandard);

    if (
      tokenStandard &&
      [TokenStandard.Fungible, TokenStandard.FungibleAsset].includes(
        tokenStandard,
      )
    ) {
      return {
        raw: item,
        pubkey: new PublicKey(item.publicKey),
        mint: new PublicKey(item.mint.publicKey),
        amount: Number(item.token.amount),
        decimals: item.mint.decimals,
        name: item.metadata.name,
        symbol: item.metadata.symbol,
        logoURI: undefined,
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

  // Fetch metadata in parallel
  await fetchTokenMetadata(tokens);

  return tokens;
}

async function getTokensByOwnerCompressed(
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
