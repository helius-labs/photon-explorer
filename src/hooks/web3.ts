"use client";

import { useCluster } from "@/providers/cluster-provider";
import {
  Signature,
  Slot,
  address,
  createSolanaRpc,
  signature,
} from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetSlot(enabled: boolean = true) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getSlot"],
    queryFn: async () => {
      const rpc = createSolanaRpc(endpoint);

      return await rpc.getSlot().send();
    },
    enabled,
  });
}

export function useGetBlock(slot: Slot, enabled: boolean = true) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getBlock", slot],
    queryFn: async () => {
      const rpc = createSolanaRpc(endpoint);

      return await rpc
        .getBlock(slot, {
          maxSupportedTransactionVersion: 0,
          transactionDetails: "full",
          encoding: "jsonParsed",
          rewards: false,
        })
        .send();
    },
    enabled,
  });
}

export function useGetTransaction(
  signatureInput: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getTransaction", signatureInput],
    queryFn: async () => {
      const rpc = createSolanaRpc(endpoint);

      return await rpc
        .getTransaction(signature(signatureInput), {
          maxSupportedTransactionVersion: 0,
          encoding: "jsonParsed",
        })
        .send();
    },
    enabled,
  });
}

export function useGetAccountInfo(
  addressInput: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getAccountInfo", addressInput],
    queryFn: async () => {
      const rpc = createSolanaRpc(endpoint);

      return await rpc
        .getAccountInfo(address(addressInput), {
          encoding: "jsonParsed",
          commitment: "processed",
        })
        .send();
    },
    enabled,
  });
}

export function useGetBalance(addressInput: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getBalance", addressInput],
    queryFn: async () => {
      const rpc = createSolanaRpc(endpoint);

      return await rpc.getBalance(address(addressInput)).send();
    },
    enabled,
  });
}

export function useGetSignaturesForAddress(
  addressInput: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getSignaturesForAddress", addressInput],
    queryFn: async () => {
      const rpc = createSolanaRpc(endpoint);

      return await rpc
        .getSignaturesForAddress(address(addressInput), {
          limit: 1000,
        })
        .send();
    },
    enabled,
  });
}

export function useGetTokenAccountsByOwner(
  addressInput: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getTokenAccountsByOwner", addressInput],
    queryFn: async () => {
      const rpc = createSolanaRpc(endpoint);

      return await rpc
        .getTokenAccountsByOwner(
          address(addressInput),
          {
            programId: address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          },
          {
            encoding: "jsonParsed",
            commitment: "processed",
          },
        )
        .send();
    },
    enabled,
  });
}
