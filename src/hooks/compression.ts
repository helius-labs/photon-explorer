"use client";

import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { createBN254, createRpc, TokenData } from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetLatestNonVotingSignatures(enabled: boolean = true) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, compressionEndpoint, "getLatestNonVotingSignatures"],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      return await connection.getLatestNonVotingSignatures();
    },
    enabled,
  });
}

export function useGetCompressionSignaturesForOwner(
  address: string,
  enabled: boolean = true,
) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
      cluster,
      compressionEndpoint,
      "getCompressionSignaturesForOwner",
      address,
    ],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      return await connection.getCompressionSignaturesForOwner(
        new PublicKey(address),
      );
    },
    enabled,
  });
}

export function useGetCompressionSignaturesForAccount(
  address: string,
  enabled: boolean = true,
) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
      cluster,
      compressionEndpoint,
      "getCompressionSignaturesForAccount",
      address,
    ],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      try {
        const hash = createBN254(address, "base58");
        return await connection.getCompressionSignaturesForAccount(hash);
      } catch (error) {
        // If the address is not a valid base58 string, return null
        return null;
      }
    },
    enabled,
  });
}

export function useGetCompressedBalanceByOwner(
  address: string,
  enabled: boolean = true,
) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, compressionEndpoint, "getCompressedBalanceByOwner", address],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      return await connection.getCompressedBalanceByOwner(
        new PublicKey(address),
      );
    },
    enabled,
  });
}

export function useGetCompressedAccountsByOwner(
  address: string,
  enabled: boolean = true,
) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, compressionEndpoint, "getCompressedAccountsByOwner", address],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      return await connection.getCompressedAccountsByOwner(
        new PublicKey(address),
      );
    },
    enabled,
  });
}

export function useGetCompressedTokenAccountsByOwner(
  address: string,
  enabled: boolean = true,
) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
      cluster,
      compressionEndpoint,
      "getCompressedTokenAccountsByOwner",
      address,
    ],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      return await connection.getCompressedTokenAccountsByOwner(
        new PublicKey(address),
      );
    },
    enabled,
  });
}

export function useGetCompressedAccount(
  address: string,
  enabled: boolean = true,
) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, compressionEndpoint, "getCompressedAccount", address],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      try {
        const hash = createBN254(address, "base58");

        // Get account hash and account address in parallel
        const [accountHash, accountAddress] = await Promise.all([
          connection.getCompressedAccount(undefined, hash),
          connection.getCompressedAccount(hash, undefined),
        ]);

        return accountHash || accountAddress || null;
      } catch (error) {
        // If the address is not a valid base58 string, return null
        return null;
      }
    },
    enabled,
  });
}

export function useGetTransactionWithCompressionInfo(
  signature: string,
  enabled: boolean = true,
) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
      cluster,
      compressionEndpoint,
      "getTransactionWithCompressionInfo",
      signature,
    ],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      const transactionWithCompressionInfo = await connection.getTransactionWithCompressionInfo(signature);
      if (!transactionWithCompressionInfo) {
        return null;
      }

      // Fetch decimals for each token
      if ([Cluster.MainnetBeta, Cluster.Devnet].includes(cluster)) {

        const mintAddresses = [
          ...transactionWithCompressionInfo.compressionInfo.openedAccounts,
          ...transactionWithCompressionInfo.compressionInfo.closedAccounts
        ]
          .map((item) => item.maybeTokenData?.mint?.toBase58())
          .filter((mint): mint is string => mint !== undefined);

        const assetData = await getAssetBatch(mintAddresses, endpoint);

        // Add token_info decimals to the transactions
        transactionWithCompressionInfo.compressionInfo.openedAccounts = transactionWithCompressionInfo.compressionInfo.openedAccounts.map(transaction => {
          const asset = assetData.find((asset: { id: string }) => asset.id === transaction.maybeTokenData?.mint?.toBase58());
          if (transaction.maybeTokenData && asset?.token_info?.decimals !== undefined) {
            (transaction.maybeTokenData as TokenData & { decimals?: number }).decimals = asset.token_info.decimals;
          }
          return transaction;
        });

        transactionWithCompressionInfo.compressionInfo.closedAccounts = transactionWithCompressionInfo.compressionInfo.closedAccounts.map(transaction => {
          const asset = assetData.find((asset: { id: string }) => asset.id === transaction.maybeTokenData?.mint?.toBase58());
          if (transaction.maybeTokenData && asset?.token_info?.decimals !== undefined) {
            (transaction.maybeTokenData as TokenData & { decimals?: number }).decimals = asset.token_info.decimals;
          }
          return transaction;
        });

      }

      return transactionWithCompressionInfo;
    },
    enabled,
  });
}

const getAssetBatch = async (ids: string[], endpoint: string) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'helius-airship',
      method: 'getAssetBatch',
      params: {
        ids: ids
      },
    }),
  });
  const { result } = await response.json();
  return result;
};


export function useGetLatestCompressionSignatures(enabled: boolean = true) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, compressionEndpoint, "getLatestCompressionSignatures"],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      return await connection.getLatestCompressionSignatures();
    },
    enabled,
  });
}

export function useGetCompressedBalance(address: string,
  enabled: boolean = true) {
  const { cluster, endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, compressionEndpoint, "getCompressedBalance", address],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      const hash = createBN254(address, "base58");

      return await connection.getCompressedBalance(undefined, hash);
    },
    enabled,
  });
}
