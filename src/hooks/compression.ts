"use client";

import { useCluster } from "@/providers/cluster-provider";
import { useQuery } from "@tanstack/react-query";

import { getCompressedAccountSchema } from "@/schemas/getCompressedAccount";
import { getCompressedAccountsByOwnerSchema } from "@/schemas/getCompressedAccountsByOwner";
import { getCompressedTokenAccountsByOwnerSchema } from "@/schemas/getCompressedTokenAccountsByOwner";
import { getCompressionSignaturesForAccountSchema } from "@/schemas/getCompressionSignaturesForAccount";
import { getCompressionSignaturesForTokenOwnerSchema } from "@/schemas/getCompressionSignaturesForTokenOwner";
import { getLatestNonVotingSignaturesSchema } from "@/schemas/getLatestNonVotingSignatures";
import { getTransactionWithCompressionInfoSchema } from "@/schemas/getTransactionWithCompressionInfo";

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
  const { compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
      compressionEndpoint,
      "getCompressionSignaturesForOwner",
      address,
    ],
    queryFn: async () => {
      const response = await fetch(compressionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getCompressionSignaturesForOwner",
          params: {
            owner: address,
          },
        }),
      }).then((res) => res.json());

      return getCompressionSignaturesForTokenOwnerSchema.parse(response);
    },
    enabled,
  });
}

export function useGetCompressionSignaturesForAccount(
  hash: string,
  enabled: boolean = true,
) {
  const { compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getCompressionSignaturesForAccount", hash],
    queryFn: async () => {
      const response = await fetch(compressionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getCompressionSignaturesForAccount",
          params: {
            hash: hash,
          },
        }),
      }).then((res) => res.json());

      return getCompressionSignaturesForAccountSchema.parse(response);
    },
    enabled,
  });
}

export function useGetCompressedBalanceByOwner(
  address: string,
  enabled: boolean = true,
) {
  const { compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getCompressedBalanceByOwner", address],
    queryFn: async () => {
      return fetch(compressionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getCompressedBalanceByOwner",
          params: {
            owner: address,
          },
        }),
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });
}

export function useGetCompressedAccountsByOwner(
  address: string,
  enabled: boolean = true,
) {
  const { compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getCompressedAccountsByOwner", address],
    queryFn: async () => {
      const results = await fetch(compressionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getCompressedAccountsByOwner",
          params: {
            owner: address,
          },
        }),
      }).then((res) => res.json());

      return getCompressedAccountsByOwnerSchema.parse(results);
    },
    enabled,
  });
}

export function useGetCompressedTokenAccountsByOwner(
  address: string,
  enabled: boolean = true,
) {
  const { compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
      compressionEndpoint,
      "getCompressedTokenAccountsByOwner",
      address,
    ],
    queryFn: async () => {
      const results = await fetch(compressionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getCompressedTokenAccountsByOwner",
          params: {
            owner: address,
          },
        }),
      }).then((res) => res.json());

      return getCompressedTokenAccountsByOwnerSchema.parse(results);
    },
    enabled,
  });
}

export function useGetCompressedAccount(hash: string, enabled: boolean = true) {
  const { compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [compressionEndpoint, "getCompressedAccount", hash],
    queryFn: async () => {
      const results = await fetch(compressionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getCompressedAccount",
          params: {
            hash: hash,
          },
        }),
      }).then((res) => res.json());

      return getCompressedAccountSchema.parse(results);
    },
    enabled,
  });
}

export function useGetTransactionWithCompressionInfo(
  signature: string,
  enabled: boolean = true,
) {
  const { compressionEndpoint } = useCluster();

  return useQuery({
    queryKey: [
      compressionEndpoint,
      "getTransactionWithCompressionInfo",
      signature,
    ],
    queryFn: async () => {
      const results = await fetch(compressionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTransactionWithCompressionInfo",
          params: {
            signature: signature,
          },
        }),
      }).then((res) => res.json());

      return getTransactionWithCompressionInfoSchema.parse(results);
    },
    enabled,
  });
}
