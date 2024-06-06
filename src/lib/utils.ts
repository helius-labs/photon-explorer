import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { addressLookupTable } from "./data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? `https://photon.helius.dev`
    : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : `http://localhost:3000`;
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
  const programName = addressLookupTable[address];

  if (programName) {
    return true;
  } else {
    return false;
  }
}

export function isSolanaAccountAddress(address: string): boolean {
  // Define the allowed Base58 characters for a Solana account address
  const base58Chars: string =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  // Check if the length is typically 44 characters (can technically be 43, but very rare) and all characters are in the Base58 set
  if (
    (address.length === 43 || address.length === 44) &&
    address.split("").every((char) => base58Chars.includes(char))
  ) {
    return true;
  } else {
    return false;
  }
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
    second: "2-digit",
    timeZoneName: "short",
    timeZone: "UTC",
  });

  if (onlyTimeAgo) {
    return timeAgo;
  } else {
    return `${timeAgo} (${formattedDate})`;
  }
}
