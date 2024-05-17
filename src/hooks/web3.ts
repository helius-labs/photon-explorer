"use client";

import { Transaction } from "@/types/transaction";
import { useQuery } from "@tanstack/react-query";

import { getSignaturesForAddressSchema } from "@/schemas/getSignaturesForAddress";
import { getTokenAccountsByOwnerSchema } from "@/schemas/getTokenAccountsByOwner";

import { useCluster } from "@/components/providers/cluster-provider";

// TODO: Validate all responses with zod schemas

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
        .then((res) => res.result as Transaction[]);
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
      const response = await fetch(endpoint, {
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
              limit: 1000,
            },
          ],
        }),
      }).then((res) => res.json());

      return getSignaturesForAddressSchema.parse(response);
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

export function useGetTokenAccountsByOwner(
  address: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [endpoint, "getTokenAccountsByOwner", address],
    queryFn: async () => {
      const response = await fetch(endpoint, {
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
      }).then((res) => res.json());

      return getTokenAccountsByOwnerSchema.parse(response);
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
