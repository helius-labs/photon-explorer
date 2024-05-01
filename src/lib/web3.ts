"use client";

import { useQuery } from "@tanstack/react-query";
import { useCluster } from "@/components/cluster-provider";

export function useGetSlot(enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading } = useQuery({
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
    isError: error,
  };
}

export function useGetBlock(slot: number, enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isPending } = useQuery({
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
    isError: error,
  };
}

export function useGetTransaction(signature: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading } = useQuery({
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
    isError: error,
  };
}
