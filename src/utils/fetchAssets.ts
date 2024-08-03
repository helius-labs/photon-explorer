import { Creator, Grouping, NFT } from "@/types/nft";
import {
  TokenStandard,
  fetchAllDigitalAssetWithTokenByOwner,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey, unwrapOption } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { PublicKey } from "@solana/web3.js";
import base58 from "bs58";

// Convert BigInt to Uint8Array
function bigIntToByteArray(bigInt: bigint): Uint8Array {
  const bytes = [];
  let remainder = bigInt;
  while (remainder > 0n) {
    bytes.unshift(Number(remainder & 0xffn));
    remainder >>= 8n;
  }
  while (bytes.length < 32) bytes.unshift(0); // pad with zeros to get 32 bytes
  return new Uint8Array(bytes);
}

// Partition address range into specified number of partitions
function partitionAddressRange(numPartitions: number) {
  const N = BigInt(numPartitions);
  const start = 0n;
  const end = 2n ** 256n - 1n;
  const range = end - start;
  const partitionSize = range / N;
  const partitions: Uint8Array[][] = [];
  for (let i = 0n; i < N; i++) {
    const s = start + i * partitionSize;
    const e = i === N - 1n ? end : s + partitionSize;
    partitions.push([bigIntToByteArray(s), bigIntToByteArray(e)]);
  }
  return partitions;
}

// Fetch assets in the specified range
async function fetchAssetsInRange(
  ownerAddress: string,
  start: Uint8Array,
  end: Uint8Array,
  endpoint: string,
): Promise<NFT[]> {
  const startStr = base58.encode(start);
  const endStr = base58.encode(end);
  let current = startStr;
  let totalItems: NFT[] = [];

  while (true) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAssetsByOwner",
        params: {
          ownerAddress,
          limit: 200,
          after: current,
          before: endStr,
          sortBy: { sortBy: "id", sortDirection: "asc" },
          options: {
            showUnverifiedCollections: true,
            showCollectionMetadata: true,
          },
        },
      }),
    });

    const { result } = await response.json();

    if (result.items.length === 0) {
      break;
    }

    const nfts: NFT[] = result.items.map((item: any) => {
      const collectionGrouping = item.grouping?.find(
        (group: Grouping) => group.group_key === "collection",
      );
      const royaltyPercentage = item.royalty?.basis_points
        ? item.royalty.basis_points / 100
        : 0;

      return {
        id: item.id,
        raw: item,
        mint: new PublicKey(item.id),
        name: item.content?.metadata?.name || "Unnamed NFT",
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
        verified:
          item.creators?.some((creator: Creator) => creator.verified) || false,
        value: item.token_info?.price_info?.price_per_token || 0,
        royaltyPercentage: royaltyPercentage,
        compression: item.compression || undefined,
      };
    });

    totalItems = totalItems.concat(nfts);
    current = result.items[result.items.length - 1].id;
  }

  //console.log("Fetched assets in range:", totalItems);
  return totalItems;
}

// Fetch partitioned assets using parallel requests
export async function fetchPartitionedAssets(
  ownerAddress: string,
  numPartitions: number,
  endpoint: string,
): Promise<NFT[]> {
  const partitions = partitionAddressRange(numPartitions);
  const promises = partitions.map(([start, end]) =>
    fetchAssetsInRange(ownerAddress, start, end, endpoint),
  );

  const results = await Promise.all(promises);
  console.log("Fetched partitioned assets:", results.flat()); // Debugging statement
  return results.flat();
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

export { fetchAssetsInRange, getNFTsByOwnerMetaplex };
