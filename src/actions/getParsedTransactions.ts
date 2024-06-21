"use server";

import { EnrichedTransaction } from "@/types/helius-sdk";

import { parseTransaction } from "@/lib/parser";

export async function getParsedTransactions(
  transactions: string[],
  cluster: string,
) {
  if (!process.env.HELIUS_API_KEY) {
    throw new Error("HELIUS_API_KEY is not set");
  }

  let url;

  if (cluster === "mainnet-beta") {
    url = `https://api.helius.xyz/v0/transactions/?api-key=${process.env.HELIUS_API_KEY}`;
  } else if (cluster === "devnet") {
    url = `https://api-devnet.helius.xyz/v0/transactions/?api-key=${process.env.HELIUS_API_KEY}`;
  } else {
    return null;
  }

  const response: EnrichedTransaction[] = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transactions: transactions,
    }),
  }).then((res) => res.json());

  const result = response.map((tx) => parseTransaction(tx)) || [];

  return result;
}
