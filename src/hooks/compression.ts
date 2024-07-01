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
  hash: string,
  enabled: boolean = true,
) {
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getCompressionSignaturesForAccount", hash],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      return await connection.getCompressionSignaturesForAccount(
        createBN254(hash, "base58"),
      );
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

export function useGetCompressedAccount(hash: string, enabled: boolean = true) {
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getCompressedAccount", hash],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      return await connection.getCompressedAccount(createBN254(hash, "base58"));
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
