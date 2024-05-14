"use client";

import { useQuery } from "@tanstack/react-query";
import { useCluster } from "@/components/providers/cluster-provider";

// TODO Add typed responses when web3.js lib is updated

export function useGetSlot(enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [endpoint, "getSlot"],
    queryFn: async () => {
      return fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getSlot",
        }),
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    slot: data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetBlock(slot: number, enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isFetching, isPending, refetch } = useQuery({
    queryKey: [endpoint, "getBlock", slot],
    queryFn: async () => {
      return fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBlock",
          params: [
            slot,
            {
              maxSupportedTransactionVersion: 0,
              transactionDetails: "full",
              encoding: "jsonParsed",
              rewards: false,
            },
          ],
        }),
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    block: data,
    isPending,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetTransaction(signature: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [endpoint, "getTransaction", signature],
    queryFn: async () => {
      return fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTransaction",
          params: [
            signature,
            { maxSupportedTransactionVersion: 0, encoding: "jsonParsed" },
          ],
        }),
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    transaction: data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetAccountInfo(address: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [endpoint, "getAccountInfo", address],
    queryFn: async () => {
      return fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getAccountInfo",
          params: [address, { encoding: "jsonParsed" }],
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

export function useGetBalance(address: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [endpoint, "getBalance", address],
    queryFn: async () => {
      return fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [address],
        }),
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    balance: data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetSignaturesForAddress(
  address: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [endpoint, "getSignaturesForAddress", address],
    queryFn: async () => {
      return fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getSignaturesForAddress",
          params: [
            address,
            {
              limit: 25,
            },
          ],
        }),
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    signatures: data,
    isLoading,
    isFetching,
    isError: error,
    refetch,
  };
}

export function useGetTokenAccountsByOwner(
  address: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [endpoint, "getTokenAccountsByOwner", address],
    queryFn: async () => {
      return fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [
            address,
            {
              programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            },
            {
              encoding: "jsonParsed",
              commitment: "processed",
            },
          ],
        }),
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    accounts: data,
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
      return fetch(compressionEndpoint, {
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
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    compressedSignatures: data,
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
      return fetch(compressionEndpoint, {
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
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    compressedSignatures: data,
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
      return fetch(compressionEndpoint, {
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
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    accounts: data,
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
      return fetch(compressionEndpoint, {
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
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
  });

  return {
    accounts: data,
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
