import { useQuery } from "@tanstack/react-query";
import { useCluster } from "@/providers/cluster-provider";

async function getPriorityFeeEstimate(endpoint: string, accounts: string[]) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getPriorityFeeEstimate",
      params: [{
        accountKeys: accounts,
        options: {
          includeAllPriorityFeeLevels: true,
          lookbackSlots: 150
        }
      }]
    }),
  }).then((res) => res.json());

  return response.result.priorityFeeLevels;
}

export function useGetPriorityFeeEstimate(accounts: string[]) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getPriorityFeeEstimate", accounts],
    queryFn: () => getPriorityFeeEstimate(endpoint, accounts),
  });
}
