import { useCluster } from "@/providers/cluster-provider";
import { DAS, Interface } from "@/types/helius-sdk";
import { NFT } from "@/types/nft";
import { Cluster } from "@/utils/cluster";
import {
  TokenStandard,
  fetchAllDigitalAssetWithTokenByOwner,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey, unwrapOption } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetNFTsByMint(mint: string, enabled: boolean = true) {
  const { cluster, endpoint } = useCluster();

  return useQuery<NFT | null, Error>({
    queryKey: [cluster, endpoint, "getNFTsByMint", mint],
    queryFn: async () => {
      let nft: NFT | null = null;

      try {
        if ([Cluster.MainnetBeta, Cluster.Devnet].includes(cluster)) {
          nft = await getNFTByMintDAS(mint, endpoint);
        } else {
          nft = await getNFTByMintMetaplex(mint, endpoint);
        }

        return nft;
      } catch (error) {
        throw error;
      }
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 60, // 1 hour
  });
}

async function getNFTByMintDAS(
  mint: string,
  endpoint: string,
): Promise<NFT | null> {
  try {
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
            showUnverifiedCollections: true,
            showCollectionMetadata: true,
            showInscription: true,
          },
        },
      }),
    });

    const data: { result: DAS.GetAssetResponse } = await response.json();
    const item = data.result;

    if (
      [
        Interface.V1NFT,
        Interface.V2NFT,
        Interface.PROGRAMMABLENFT,
        Interface.LEGACYNFT,
        Interface.V1PRINT,
        Interface.CUSTOM,
      ].includes(item.interface)
    ) {
      const collectionGrouping = item.grouping?.find(
        (group) => group.group_key === "collection",
      );
      const royaltyPercentage = item.royalty?.basis_points
        ? item.royalty.basis_points / 100
        : 0;

      const nft: NFT = {
        raw: item,
        mint: new PublicKey(item.id),
        name: item.content?.metadata?.name || "",
        image: item.content?.links?.image || "",
        description: item.content?.metadata?.description || "",
        owner: item.ownership?.owner || "",
        mintAuthority: item.token_info?.mint_authority || "",
        updateAuthority:
          item.mint_extensions?.metadata_pointer?.authority || "",
        collection: collectionGrouping?.group_value || "",
        collectionName: collectionGrouping?.collection_metadata?.name || "",
        tokenStandard: item.content?.metadata?.token_standard || "",
        creators: item.creators || [],
        attributes: item.content?.metadata?.attributes || [],
        verified: item.creators?.some((creator) => creator.verified) || false,
        value: item.token_info?.price_info?.price_per_token || 0,
        royaltyPercentage: royaltyPercentage,
        compression: item.compression || undefined,
      };
      return nft;
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function getNFTByMintMetaplex(
  mint: string,
  endpoint: string,
): Promise<NFT | null> {
  const umi = createUmi(endpoint).use(mplTokenMetadata());

  const assets = await fetchAllDigitalAssetWithTokenByOwner(
    umi,
    publicKey(mint),
    {
      tokenStrategy: "getProgramAccounts",
    },
  );

  const item = assets.find(
    (item: any) =>
      unwrapOption(item.metadata.tokenStandard) === TokenStandard.NonFungible &&
      item.mint.publicKey.toBase58() === mint,
  );

  if (!item) return null;

  const nft: NFT = {
    raw: item,
    mint: new PublicKey(item.mint.publicKey),
    name: item.metadata.name || "",
    image: item.metadata.uri || "",
    verified:
      unwrapOption(item.metadata.creators)?.some(
        (creator: any) => creator.verified,
      ) || false,
  };

  await fetchNftMetadata([nft]);

  return nft;
}

const fetchNftMetadata = async (nfts: NFT[]) => {
  const fetchMetadata = async (nft: NFT) => {
    if (nft.raw.metadata.uri) {
      try {
        const response = await fetch(nft.raw.metadata.uri);
        const externalMetadata = await response.json();
        nft.image = externalMetadata.image;
        nft.description = externalMetadata.description;
        nft.attributes = externalMetadata.attributes;
      } catch (error) {}
    }
  };

  await Promise.all(nfts.map(fetchMetadata));
};
