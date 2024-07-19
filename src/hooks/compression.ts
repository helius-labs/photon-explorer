"use client";

import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { createBN254, createRpc } from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetLatestNonVotingSignatures(enabled: boolean = true) {
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getLatestNonVotingSignatures"],
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
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
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
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
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
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getCompressedBalanceByOwner", address],
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
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getCompressedAccountsByOwner", address],
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
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
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
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getCompressedAccount", address],
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
      compressionEndpoint,
      "getTransactionWithCompressionInfo",
      signature,
    ],
    queryFn: async () => {
      if (cluster === Cluster.Localnet || cluster === Cluster.Testnet) {
        const connection = createRpc(endpoint, compressionEndpoint, undefined, {
          commitment: "processed",
        });

        return await connection.getTransactionWithCompressionInfo(signature);
      }
      return null;
    },
    enabled,
  });
}
