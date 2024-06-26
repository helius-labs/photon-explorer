"use client";

import { useCluster } from "@/providers/cluster-provider";
import { createBN254, createRpc } from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

import { getLatestNonVotingSignaturesSchema } from "@/schemas/getLatestNonVotingSignatures";

export function useGetLatestNonVotingSignatures(enabled: boolean = true) {
  const { compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getLatestNonVotingSignatures"],
    queryFn: async () => {
      const response = await fetch(compressionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getLatestNonVotingSignatures",
          params: {},
        }),
      }).then((res) => res.json());

      return getLatestNonVotingSignaturesSchema.parse(response);
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

export function useGetSignaturesForCompressedAccount(
  hash: string,
  enabled: boolean = true,
) {
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getSignaturesForCompressedAccount", hash],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      return await connection.getSignaturesForCompressedAccount(
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

      // TODO - remove mint option when the endpoint is fixed
      return await connection.getCompressedTokenAccountsByOwner(
        new PublicKey(address),
        {
          mint: new PublicKey(""),
        },
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
  const { endpoint, compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
      compressionEndpoint,
      "getTransactionWithCompressionInfo",
      signature,
    ],
    queryFn: async () => {
      const connection = createRpc(endpoint, compressionEndpoint, undefined, {
        commitment: "processed",
      });

      return await connection.getTransactionWithCompressionInfo(signature);
    },
    enabled,
  });
}
