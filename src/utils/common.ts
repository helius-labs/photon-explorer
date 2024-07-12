import {
  getHashedNameSync,
  getNameAccountKeySync,
  resolve,
} from "@bonfida/spl-name-service";
import { TldParser } from "@onsol/tldparser";
import { Connection, PublicKey } from "@solana/web3.js";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { PROGRAM_INFO_BY_ID } from "./programs";

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
  if (typeof lamports === "number") {
    return lamports / LAMPORTS_PER_SOL;
  }

  let signMultiplier = 1;
  if (lamports < 0) {
    signMultiplier = -1;
  }

  const absLamports = lamports < 0 ? -lamports : lamports;
  const lamportsString = absLamports.toString(10).padStart(10, "0");
  const splitIndex = lamportsString.length - 9;
  const solString =
    lamportsString.slice(0, splitIndex) +
    "." +
    lamportsString.slice(splitIndex);
  return signMultiplier * parseFloat(solString);
}

export function shorten(string: string, chars = 4): string {
  return `${string.slice(0, chars)}...${string.slice(-chars)}`;
}

export function shortenLong(string: string, chars = 8): string {
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

export function lamportsToSolString(
  lamports: number | bigint,
  maximumFractionDigits = 9,
): string {
  const sol = lamportsToSol(lamports);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(sol);
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

// Address of the SOL TLD
export const SOL_TLD_AUTHORITY = new PublicKey(
  "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx",
);

export function getDomainKeySync(
  name: string,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
) {
  const hashedDomainName = getHashedNameSync(name);
  const nameKey = getNameAccountKeySync(
    hashedDomainName,
    nameClass,
    nameParent,
  );
  return nameKey;
}

export interface DomainInfo {
  name: string;
  address: PublicKey;
  owner: string;
}

export const hasDomainSyntax = (value: string) => {
  return value.length > 4 && value.substring(value.length - 4) === ".sol";
};

// Check if a string is a valid Bonfida domain
export async function isBonfidaDomainAddress(
  domain: string,
  connection: Connection,
): Promise<boolean> {
  const probablyBonfidaName = hasDomainSyntax(domain);
  if (probablyBonfidaName) {
    try {
      const domainKey = getDomainKeySync(
        domain.slice(0, -4), // remove .sol
        undefined,
        SOL_TLD_AUTHORITY,
      );
      const accountInfo = await connection.getAccountInfo(domainKey);
      if (accountInfo) {
        const ownerPublicKey = await resolve(connection, domain);
        return ownerPublicKey !== null;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  return false;
}

// Function to check if a string is a valid ANS domain
export async function isAlternativeDomainAddress(
  domain: string,
  connection: Connection,
): Promise<boolean> {
  const probablyAnsDomain = domain.length > 4 && domain.includes(".");
  if (probablyAnsDomain) {
    const ans = new TldParser(connection);
    try {
      const owner = await ans.getOwnerFromDomainTld(domain);
      return owner !== undefined;
    } catch (error) {
      return false;
    }
  }

  return false;
}

export function timeAgoWithFormat(
  unixTimestamp: number,
  onlyTimeAgo: boolean = false,
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
    timeAgo = `${minutes} minutes ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    timeAgo = `${hours} hours ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    timeAgo = `${days} days ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    timeAgo = `${months} months ago`;
  }

  // Format date like "April 15, 2024 17:14:03 UTC"
  const formattedDate = date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "UTC",
  });

  if (onlyTimeAgo) {
    return timeAgo;
  } else {
    return `${timeAgo} (${formattedDate}`;
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
