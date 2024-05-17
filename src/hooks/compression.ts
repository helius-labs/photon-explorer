"use client";

import { useQuery } from "@tanstack/react-query";

import { getCompressedAccountsByOwnerSchema } from "@/schemas/getCompressedAccountsByOwner";
import { getCompressedTokenAccountsByOwnerSchema } from "@/schemas/getCompressedTokenAccountsByOwner";
import { getCompressionSignaturesForAccountSchema } from "@/schemas/getCompressionSignaturesForAccount";
import { getCompressionSignaturesForTokenOwnerSchema } from "@/schemas/getCompressionSignaturesForTokenOwner";
import { getLatestCompressionSignaturesSchema } from "@/schemas/getLatestCompressionSignatures";
import { getLatestNonVotingSignaturesSchema } from "@/schemas/getLatestNonVotingSignatures";

import { useCluster } from "@/components/providers/cluster-provider";

// TODO: Validate all responses with zod schemas

export function useGetLatestCompressionSignatures(enabled: boolean = true) {
  const { compressionEndpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [compressionEndpoint, "getLatestCompressionSignatures"],
    queryFn: async () => {
      const response = await fetch(compressionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getLatestCompressionSignatures",
          params: {},
        }),
      }).then((res) => res.json());

      return getLatestCompressionSignaturesSchema.parse(response);
    },
    enabled,
  });

  return {
    data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetLatestNonVotingSignatures(enabled: boolean = true) {
  const { compressionEndpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
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

  return {
    data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetCompressionSignaturesForOwner(
  address: string,
  enabled: boolean = true,
) {
  const { compressionEndpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
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

  return {
    data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetCompressionSignaturesForAccount(
  hash: string,
  enabled: boolean = true,
) {
  const { compressionEndpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
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

  return {
    data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetCompressedBalanceByOwner(
  address: string,
  enabled: boolean = true,
) {
  const { compressionEndpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
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

  return {
    compressedBalance: data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetCompressedAccountsByOwner(
  address: string,
  enabled: boolean = true,
) {
  const { compressionEndpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
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

  return {
    data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetCompressedTokenAccountsByOwner(
  address: string,
  enabled: boolean = true,
) {
  const { compressionEndpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
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

  return {
    data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetCompressedAccount(hash: string, enabled: boolean = true) {
  const { compressionEndpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [compressionEndpoint, "getCompressedAccount", hash],
    queryFn: async () => {
      return fetch(compressionEndpoint, {
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
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    account: data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetCompressedBalance(hash: string, enabled: boolean = true) {
  const { compressionEndpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [compressionEndpoint, "getCompressedBalance", hash],
    queryFn: async () => {
      return fetch(compressionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getCompressedBalance",
          params: {
            hash: hash,
          },
        }),
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    compressedBalance: data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetTransactionWithCompressionInfo(
  signature: string,
  enabled: boolean = true,
) {
  const { compressionEndpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      compressionEndpoint,
      "getTransactionWithCompressionInfo",
      signature,
    ],
    queryFn: async () => {
      return fetch(compressionEndpoint, {
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
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    transactionWithCompressionInfo: data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}
