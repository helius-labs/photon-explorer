import { Cluster, PublicKey } from "@solana/web3.js";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { PROGRAM_INFO_BY_ID } from "./programs";
import { LOADER_IDS } from "./programs";

export const LAMPORTS_PER_SOL = 1_000_000_000;
export const MICRO_LAMPORTS_PER_LAMPORT = 1_000_000;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : `http://localhost:3000`;
}

export function lamportsToSol(lamports: number | bigint): number {
  const lamportsPerSol = BigInt(LAMPORTS_PER_SOL);
  const bigIntLamports = BigInt(lamports);

  const solPart = bigIntLamports / lamportsPerSol;
  const fractionalPart = bigIntLamports % lamportsPerSol;

  return Number(solPart) + Number(fractionalPart) / LAMPORTS_PER_SOL;
}

export function lamportsToSolString(lamports: number | bigint, maximumFractionDigits: number = 9): string {
  const solValue = lamportsToSol(lamports);
  return solValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maximumFractionDigits,
  });
}

export function shorten(string: string | undefined, chars = 4): string {
  if (!string) return "";
  return `${string.slice(0, chars)}...${string.slice(-chars)}`;
}

export function shortenLong(string: any, chars: number = 8): string {
  if (typeof string !== "string") {
    return ""; // Return an empty string if the input is not a string
  }

  if (string.length <= chars * 2) {
    return string; // Return the original string if it's shorter than twice the chars
  }

  return `${string.slice(0, chars)}...${string.slice(-chars)}`;
}

export function normalizeTokenAmount(
  raw: string | number,
  decimals: number,
): number {
  let rawTokens: number;
  if (typeof raw === "string") rawTokens = parseInt(raw);
  else rawTokens = raw;
  return rawTokens / Math.pow(10, decimals);
}

export function isSolanaSignature(txHash: string): boolean {
  // Define the allowed Base58 characters for a Solana transaction hash
  const base58Chars: string =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  // Check if the length is exactly 88 characters and all characters are in the Base58 set
  if (
    (txHash.length === 87 || txHash.length === 88) &&
    txHash.split("").every((char) => base58Chars.includes(char))
  ) {
    return true;
  } else {
    return false;
  }
}

export function isSolanaProgramAddress(address: string): boolean {
  const programName = PROGRAM_INFO_BY_ID[address];

  if (programName) {
    return true;
  } else {
    return false;
  }
}

export function isSolanaAccountAddress(address: string): boolean {
  // Define the allowed Base58 characters for a Solana account address
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

export function timeAgoWithFormat(
  unixTimestamp: number,
  onlyTimeAgo: boolean = false,
  shortDate: boolean = false,
): string {
  // Convert Unix timestamp from seconds to milliseconds
  const date = new Date(unixTimestamp * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  let timeAgo: string;

  // Calculate relative time ago
  if (diffInSeconds < 60) {
    timeAgo = `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    timeAgo = minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    timeAgo = hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    timeAgo = days === 1 ? "1 day ago" : `${days} days ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    timeAgo = months === 1 ? "1 month ago" : `${months} months ago`;
  }

  // Format date like "April 15, 2024 17:14:03 UTC"
  const formattedDate = date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "UTC",
  });

  if (onlyTimeAgo) {
    return timeAgo;
  } else if (shortDate) {
    return `${formattedDate}`;
  } else {
    return `${timeAgo} (${formattedDate})`;
  }
}

export function dateFormat(unixTimestamp: number): string {
  // Convert Unix timestamp from seconds to milliseconds
  const date = new Date(unixTimestamp * 1000);

  // Format date like "April 15, 2024 17:14:03 UTC"
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "UTC",
  });
}

export function getSignature(transaction: any): string {
  if (transaction && typeof transaction === "object") {
    if ("signature" in transaction) {
      return transaction.signature;
    } else if (
      "transaction" in transaction &&
      Array.isArray(transaction.transaction.signatures)
    ) {
      return transaction.transaction.signatures[0];
    }
  }
  throw new Error("Unsupported transaction type");
}

export function programLabel(address: string, cluster: Cluster): string | undefined {
  const programInfo = PROGRAM_INFO_BY_ID[address];
  if (programInfo && programInfo.deployments.includes(cluster)) {
    return programInfo.name;
  }

  return LOADER_IDS[address] as string;
}