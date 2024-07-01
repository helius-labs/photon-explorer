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
