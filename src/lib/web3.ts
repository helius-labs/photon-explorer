"use client";

import { useQuery } from "@tanstack/react-query";
import { useCluster } from "@/components/cluster-provider";

export function useGetSlot(enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, refetch } = useQuery({
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
    refetchOnWindowFocus: false,
  });

  return {
    slot: data,
    isLoading,
    isError: error,
    refetch,
  };
}

export function useGetBlock(slot: number, enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, isPending, refetch } = useQuery({
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
    refetchOnWindowFocus: false,
  });

  return {
    block: data,
    isPending,
    isLoading,
    isError: error,
    refetch,
  };
}

export function useGetTransaction(signature: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, refetch } = useQuery({
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
    refetchOnWindowFocus: false,
  });

  return {
    transaction: data,
    isLoading,
    isError: error,
    refetch,
  };
}

export function useGetAccountInfo(address: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, refetch } = useQuery({
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
    refetchOnWindowFocus: false,
  });

  return {
    account: data,
    isLoading,
    isError: error,
    refetch,
  };
}

export function useGetBalance(address: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, refetch } = useQuery({
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
    refetchOnWindowFocus: false,
  });

  return {
    balance: data,
    isLoading,
    isError: error,
    refetch,
  };
}

export function useGetSignaturesForAddress(
  address: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  const { data, error, isLoading, refetch } = useQuery({
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
              limit: 50,
            },
          ],
        }),
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
    enabled,
    refetchOnWindowFocus: false,
  });

  return {
    signatures: data,
    isLoading,
    isError: error,
    refetch,
  };
}

export function getTransfers(parsedTransaction: any) {
  const SPL_TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
  const TRANSFER_IX_TYPES = ["transferchecked", "transfer"];

  for (const instruction of parsedTransaction.transaction.message
    .instructions) {
    if (
      instruction.programId == SPL_TOKEN_PROGRAM_ID &&
      TRANSFER_IX_TYPES.includes(instruction.parsed.type.toLowerCase())
    ) {
      console.log("instruction data:", JSON.stringify(instruction, null, 1));
    }
  }
}
