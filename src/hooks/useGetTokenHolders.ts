import { useCluster } from "@/providers/cluster-provider";
import { useQuery } from "@tanstack/react-query";

const fetchTokenHolders = async (
  mint: string,
  endpoint: string,
): Promise<number> => {
  let allOwners = new Set<string>();
  let cursor: string | undefined = undefined;

  while (true) {
    const params: any = {
      mint,
      limit: 1000,
    };

    if (cursor) {
      params.cursor = cursor;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "helius-token-holders",
          method: "getTokenAccounts",
          params,
        }),
      });

      const data = await response.json();

      if (!data.result || data.result.token_accounts.length === 0) {
        break;
      }

      data.result.token_accounts.forEach((account: any) => {
        allOwners.add(account.owner);
      });

      if (!data.result.cursor) {
        break;
      }

      cursor = data.result.cursor;
    } catch (error) {
      console.error("Error fetching token holders:", error);
      break;
    }
  }

  return allOwners.size;
};

export function useGetTokenHolders(mint: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  return useQuery<number>({
    queryKey: ["getTokenHolders", mint],
    queryFn: () => fetchTokenHolders(mint, endpoint),
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
