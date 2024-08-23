import { getBaseUrl } from "@/utils/common";

import { tokenMetricsSchema } from "@/schemas/tokenMetrics";

const apiBaseUrl = getBaseUrl();

export async function getTokenMetrics(address: string) {
  const response = await fetch(`${apiBaseUrl}/api/token-metrics/${address}`);
  if (!response.ok) {
    throw new Error(`Error fetching token metrics for address: ${address}`);
  }
  const data = await response.json();
  return tokenMetricsSchema.parse(data);
}
