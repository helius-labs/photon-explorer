import { tokenMetricsSchema } from "@/schemas/tokenMetrics";

export async function getTokenMetrics(address: string) {
  const response = await fetch(`http://localhost:3000/api/proxy/${address}`);
  if (!response.ok) {
    throw new Error(`Error fetching token metrics for address: ${address}`);
  }
  const data = await response.json();
  return tokenMetricsSchema.parse(data);
}
