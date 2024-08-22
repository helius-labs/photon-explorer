import { NFT } from "@/types/nft";
import {
  fetchMerkleTree,
  mplBubblegum,
} from "@metaplex-foundation/mpl-bubblegum";
import { createUmi, publicKey } from "@metaplex-foundation/umi";
import { defaultPlugins } from "@metaplex-foundation/umi-bundle-defaults";

import { SpamModel, defaultModel } from "./spamModel";

const model: SpamModel = defaultModel;
let umiInstance: ReturnType<typeof createUmi> | null = null;

const getUmiInstance = (rpcUrl: string) => {
  if (!umiInstance) {
    umiInstance = createUmi().use(defaultPlugins(rpcUrl)).use(mplBubblegum());
  }
  return umiInstance;
};

const getProofLength = async (
  treeId: string,
  rpcUrl: string,
): Promise<number> => {
  const umi = getUmiInstance(rpcUrl);
  const treePublicKey = publicKey(treeId);
  const tree = await fetchMerkleTree(umi, treePublicKey);

  return tree.treeHeader.maxDepth - (Math.log2(tree.canopy.length + 2) - 1);
};

const tokenize = (text: string | undefined): string[] => {
  if (!text) return [];

  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3);
};

const calculateSpamProbability = (tokens: string[]): number => {
  let spamLikelihood = model.spam.size / (model.spam.size + model.ham.size);
  let hamLikelihood = 1 - spamLikelihood;

  tokens.forEach((token) => {
    const spamTokenLikelihood =
      ((model.spam.tokens[token] || 0) + 1) / (model.spam.size + 2);
    const hamTokenLikelihood =
      ((model.ham.tokens[token] || 0) + 1) / (model.ham.size + 2);
    spamLikelihood *= spamTokenLikelihood;
    hamLikelihood *= hamTokenLikelihood;
  });

  return spamLikelihood / (spamLikelihood + hamLikelihood);
};

const spamIndicators = [
  "claim",
  "airdrop",
  "free",
  "giveaway",
  "limited time",
  "exclusive offer",
  ".run",
  ".online",
  ".io",
  ".com",
  "₿",
  "♚",
  "♛",
  "✅",
  "⭐",
  "➤",
  "$",
  "drop",
  "air drop",
  "pass",
  "voucher",
  "whitelist",
  "magiceden",
  "reward",
  ".lol",
  "🎁",
  ".app",
  "www",
  "eligible",
];

export const isLikelySpam = async (nft: NFT): Promise<boolean> => {
  // Tokenize the NFT data
  const nameTokens = tokenize(nft.name);
  const descriptionTokens = tokenize(nft.description);
  const attributeTokens =
    nft.attributes?.flatMap((attribute) => [
      ...tokenize(attribute.trait_type),
      ...tokenize(attribute.value.toString()),
    ]) || [];
  const allTokens = [...nameTokens, ...descriptionTokens, ...attributeTokens];

  // Check for spam indicators
  const hasSpamIndicator = spamIndicators.some(
    (indicator) =>
      nft.name?.toLowerCase().includes(indicator.toLowerCase()) ||
      nft.description?.toLowerCase().includes(indicator.toLowerCase()),
  );

  // Check for spam collection indicators
  const hasSpamCollectionIndicator = spamIndicators.some((indicator) =>
    nft.collectionName?.toLowerCase().includes(indicator.toLowerCase()),
  );

  // Check for unusually long descriptions
  const hasLongDescription = (nft.description?.length || 0) > 600;

  // Check for unverified creators
  const hasUnverifiedCreator = nft.creators?.some(
    (creator) => !creator.verified,
  );

  // Check for suspicious attributes
  const hasSuspiciousAttributes = nft.attributes?.some(
    (attribute) =>
      attribute.trait_type.toLowerCase().includes("website") ||
      attribute.trait_type.toLowerCase().includes("url") ||
      attribute.trait_type.toLowerCase().includes("time left") ||
      attribute.value.toString().toLowerCase().includes("http") ||
      attribute.value.toString().toLowerCase().includes("https"),
  );

  // Calcualte spam probability using the model
  const spamProbability = calculateSpamProbability(allTokens);

  // Calculate proof length
  let proofLengthImpossible = false;

  // if (nft.compression?.compressed && nft.compression?.tree) {
  //   const proofLength = await getProofLength(nft.compression.tree, process.env.NEXT_PUBLIC_MAINNET!);
  //   proofLengthImpossible = proofLength > 23;
  // }

  const spamScore =
    (hasSpamIndicator ? 0.35 : 0) +
    (hasSpamCollectionIndicator ? 0.6 : 0) +
    (hasLongDescription ? 0.1 : 0) +
    (hasUnverifiedCreator ? 0.15 : 0) +
    (hasSuspiciousAttributes ? 0.15 : 0) +
    spamProbability * 0.2; // +
    //proofLengthImpossible ? 0.1 : 0;

  return spamScore > 0.5;
};

export const filterSpamNFTs = async (nfts: NFT[]): Promise<NFT[]> => {
  const spamChecks = await Promise.all(nfts.map((nft) => isLikelySpam(nft)));
  return nfts.filter((_, index) => !spamChecks[index]);
};
