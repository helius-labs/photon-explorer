"use client";

// You may need to adjust this import based on your project structure
import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { findAllStakeAccountsByAuth } from "@soceanfi/solana-stake-sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

const calculateTotalStake = (stakeAccounts: any[]): number => {
  return (
    stakeAccounts.reduce((total, account) => {
      const stakeAmount =
        account.accountInfo.data.info.stake?.delegation?.stake || 0;
      return total + Number(stakeAmount);
    }, 0) / 1e9
  ); // Convert lamports to SOL
};

export function useGetTotalStake(publicKey: string, enabled: boolean = true) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, "getTotalStake", publicKey],
    queryFn: async () => {
      if (!endpoint) return null;

      const connection = new Connection(endpoint);

      try {
        const stakeAccounts = await findAllStakeAccountsByAuth(
          connection,
          { staker: new PublicKey(publicKey) },
          "confirmed",
        );

        return calculateTotalStake(stakeAccounts);
      } catch (error) {
        console.error("Error fetching stake accounts:", error);
        throw error;
      }
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
