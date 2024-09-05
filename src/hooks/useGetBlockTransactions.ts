import { Connection } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useCluster } from "@/providers/cluster-provider";
import { XrayTransaction } from "@/utils/parser";
import { getParsedTransactions } from "@/server/getParsedTransactions";
import { Cluster } from "@/utils/cluster";

export const useGetBlockTransactions = (slot: number) => {
  const { endpoint, cluster } = useCluster();
 
  return useQuery<XrayTransaction[], Error>({
    queryKey: [endpoint, "getBlockTransactions", slot],
    queryFn: async () => {
      const connection = new Connection(endpoint);
     
      const block = await connection.getBlock(slot);
      if (!block) throw new Error("Block not found");

      const signatures = block.transactions.map(tx => tx.transaction.signatures[0]);

      const xrayTransactions = await getParsedTransactions(signatures, cluster as Cluster);
      if (!xrayTransactions) throw new Error("Failed to parse transactions");

      return xrayTransactions;
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });
};
