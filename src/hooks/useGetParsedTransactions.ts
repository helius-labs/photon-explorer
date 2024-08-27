import { getParsedTransactions } from "@/server/getParsedTransactions";
import { Cluster } from "@/utils/cluster";
import { useQuery } from "@tanstack/react-query";

export function useGetParsedTransactions(
  transactions: string[],
  cluster: Cluster,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["parsedTransactions", transactions, cluster],
    queryFn: () => getParsedTransactions(transactions, cluster),
    // temp removed to fix loading issue on return to the page
    // staleTime: 1000 * 60 * 5, //5 mins
    // refetchInterval: 1000 * 60 * 5, //5 mins
    enabled,
  });
}
