"use server";
import { EnrichedTransaction } from "@/types/helius-sdk";
import { Cluster } from "@/utils/cluster";
import { parseTransaction } from "@/utils/parser";

export async function getParsedTransactions(
  transactions: string[],
  cluster: Cluster,
) {
  if (!process.env.HELIUS_API_KEY) {
    throw new Error("HELIUS_API_KEY is not set");
  }
  
  let url;

  if (cluster === Cluster.MainnetBeta) {
    url = `https://api.helius.xyz/v0/transactions/?api-key=${process.env.HELIUS_API_KEY}`;
  } else if (cluster === Cluster.Devnet) {
    url = `https://api-devnet.helius.xyz/v0/transactions/?api-key=${process.env.HELIUS_API_KEY}`;
  } else {
    console.error("Invalid cluster:", cluster);
    return null;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactions: transactions,
      }),
    });

    if (!response.ok) {
      console.error("API response not ok:", response.status, response.statusText);
      const text = await response.text();
      console.error("Response body:", text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (!Array.isArray(data)) {
      console.error("API did not return an array:", data);
      return null;
    }

    const result = data.map((tx: EnrichedTransaction) => parseTransaction(tx)) || [];
    return result;
  } catch (error) {
    console.error("Error in getParsedTransactions:", error);
    return null;
  }
}