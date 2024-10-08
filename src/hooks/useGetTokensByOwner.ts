import { useCluster } from "@/providers/cluster-provider";
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

      const publicKey = new PublicKey(address);

      if ([Cluster.MainnetBeta, Cluster.Devnet].includes(cluster)) {
        // Use Helius DAS API for Mainnet and Devnet
        tokens = await getTokensByOwnerDAS(publicKey.toBase58(), 1, endpoint);
      } else {
        // Use Metaplex for custom, localnet
        tokens = await getTokensByOwnerMetaplex(publicKey.toBase58(), endpoint);
      }

      let compressed = await getTokensByOwnerCompressed(
        publicKey.toBase58(),
        endpoint,
        compressionEndpoint,
      );

      // Fetch decimals for compressed tokens using Helius DAS API
      if ([Cluster.MainnetBeta, Cluster.Devnet].includes(cluster)) {
        const assetIds = compressed.map((token) => token.mint.toBase58());
        const assetData = await getAssetBatch(endpoint, assetIds);

        compressed = compressed.map(token => {
          const asset = assetData.find((asset: { id: string }) => asset.id === token.mint.toBase58());
          if (asset) {
            token.decimals = asset.token_info?.decimals || 0
            token.symbol = asset.token_info?.symbol || ""
          }
          return token;
        });
      }

      tokens = tokens.concat(compressed);

      tokens.sort((a, b) => {
        const amountA = normalizeTokenAmount(a.amount, a.decimals);
        const amountB = normalizeTokenAmount(b.amount, b.decimals);
        if (amountA === amountB) return 0;
        return amountB > amountA ? 1 : -1;
      });

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
          showZeroBalance: true,
        },
      },
    }),
  });

  const data: AssetResponse = await response.json();

  const tokens: Token[] = data.result.items.flatMap((item) => {
    if (
      item.token_info?.associated_token_address
    ) {
      return {
        raw: item,
        address: item.token_info?.associated_token_address,
        pubkey: new PublicKey(item.token_info?.associated_token_address),
        name: item.content?.metadata?.name,
        symbol: item.token_info?.symbol,
        logoURI: item.content?.links?.image,
        amount: item.token_info?.balance || 0,
        decimals: item.token_info?.decimals || 0,
        value: item.token_info?.price_info?.total_price,
        price: item.token_info?.price_info?.price_per_token,
        mint: new PublicKey(item.id),
        compressed: false,
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
        address: new PublicKey(item.publicKey).toBase58(),
        pubkey: new PublicKey(item.publicKey),
        mint: new PublicKey(item.mint.publicKey),
        amount: Number(item.token.amount),
        decimals: item.mint.decimals,
        name: item.metadata.name,
        symbol: item.metadata.symbol,
        logoURI: undefined,
        compressed: false,
      };
    }
    return [];
  });

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

  const tokens: Token[] = data.items.map((item) => {
    return {
      raw: item,
      address: new PublicKey(item.compressedAccount.hash).toBase58(),
      pubkey: new PublicKey(item.compressedAccount.hash),
      amount: item.parsed.amount,
      mint: new PublicKey(item.parsed.mint),
      decimals: 0,
      compressed: true,
    };
  });

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

const getAssetBatch = async (endpoint: string, ids: string[]) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'helius-airship',
      method: 'getAssetBatch',
      params: {
        ids: ids
      },
    }),
  });
  const { result } = await response.json();
  return result;
};