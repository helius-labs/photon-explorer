{
  /*import { useCluster } from "@/providers/cluster-provider";
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

export function useGetNFTsByOwner(address: string, enabled: boolean = true) {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getNFTsByOwner", address],
    queryFn: async () => {
      let nfts: NFT[] = [];

      if ([Cluster.MainnetBeta, Cluster.Devnet].includes(cluster)) {
        // Use Helius DAS API for Mainnet and Devnet
        nfts = await getNFTsByOwnerDAS(address, 1, endpoint);
      } else {
        // Use Metaplex for custom, localnet and testnet
        nfts = await getNFTsByOwnerMetaplex(address, endpoint);
      }

      nfts.sort((a, b) => (b.value || 0) - (a.value || 0));

      return nfts;
    },
    enabled,
  });
}

async function getNFTsByOwnerDAS(
  address: string,
  page: number = 1,
  endpoint: string,
): Promise<NFT[]> {
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
        limit: 100,
        page,
        sortBy: {
          sortBy: "recent_action",
          sortDirection: "asc",
        },
        options: {
          showUnverifiedCollections: true,
          showCollectionMetadata: true,
          showInscription: true,
        },
      },
    }),
  });

  const data: { result: DAS.GetAssetResponseList } = await response.json();

  const nfts: NFT[] = data.result.items.flatMap((item) => {
    if (
      [
        Interface.V1NFT,
        Interface.V2NFT,
        Interface.PROGRAMMABLENFT,
        Interface.LEGACYNFT,
        Interface.V1PRINT,
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
        name: item.content?.metadata.name,
        image: item.content?.links?.image,
        description: item.content?.metadata?.description,
        owner: item.ownership?.owner,
        mintAuthority: item.token_info?.mint_authority,
        updateAuthority: item.mint_extensions?.metadata_pointer?.authority,
        collection: collectionGrouping?.group_value,
        collectionName: collectionGrouping?.collection_metadata?.name,
        tokenStandard: item.content?.metadata?.token_standard,
        creators: item.creators,
        attributes: item.content?.metadata?.attributes,
        verified: item.creators?.some((creator) => creator.verified),
        value: item.token_info?.price_info?.price_per_token,
        royaltyPercentage: royaltyPercentage,
        compression: item.compression,
      };
      return nft;
    }
    return [];
  });
  return nfts;
}

async function getNFTsByOwnerMetaplex(
  address: string,
  endpoint: string,
): Promise<NFT[]> {
  const umi = createUmi(endpoint).use(mplTokenMetadata());

  // Fetch symbols and logos for tokens
  const assets = await fetchAllDigitalAssetWithTokenByOwner(
    umi,
    publicKey(address),
    {
      tokenStrategy: "getProgramAccounts",
    },
  );

  const nfts: NFT[] = assets.flatMap((item) => {
    const tokenStandard = unwrapOption(item.metadata.tokenStandard);

    if (
      tokenStandard &&
      [
        TokenStandard.NonFungible,
        TokenStandard.NonFungibleEdition,
        TokenStandard.ProgrammableNonFungible,
        TokenStandard.ProgrammableNonFungibleEdition,
      ].includes(tokenStandard)
    ) {
      return {
        raw: item,
        mint: new PublicKey(item.mint.publicKey),
        name: item.metadata.name,
        uri: item.metadata.uri,
        verified: unwrapOption(item.metadata.creators)?.some(
          (creator) => creator.verified,
        ),
      };
    }
    return [];
  });

  // Fetch metadata in parallel
  await fetchNftMetadata(nfts);

  return nfts;
}

const fetchNftMetadata = async (nfts: NFT[]) => {
  const fetchMetadata = async (nft: NFT) => {
    if (nft.raw.metadata.uri) {
      try {
        const response = await fetch(nft.raw.metadata.uri);
        const externalMetadata = await response.json();
        nft.image = externalMetadata.image;
      } catch (error) {
        console.error("Error fetching external metadata for NFT:", error);
      }
    }
  };

  await Promise.all(nfts.map(fetchMetadata));
};
*/
}
