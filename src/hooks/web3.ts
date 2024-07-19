"use client";

import { useCluster } from "@/providers/cluster-provider";
import { Connection, PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useGetSlot(enabled: boolean = true) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getSlot"],
    queryFn: async () => {
      const connection = new Connection(endpoint, "processed");

      return await connection.getSlot();
    },
    enabled,
  });
}

export function useGetBlock(slot: number, enabled: boolean = true) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getBlock", slot],
    queryFn: async () => {
      const connection = new Connection(endpoint, "confirmed");

      return await connection.getBlock(Number(slot), {
        maxSupportedTransactionVersion: 0,
      });
    },
    enabled,
  });
}

export function useGetTransaction(signature: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getTransaction", signature],
    queryFn: async () => {
      const connection = new Connection(endpoint, "confirmed");

      return await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
    },
    enabled,
  });
}

export function useGetSignatureStatus(
  signature: string,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getSignatureStatus", signature],
    queryFn: async () => {
      const connection = new Connection(endpoint, "processed");

      return await connection.getSignatureStatus(signature, {
        searchTransactionHistory: true,
      });
    },
    enabled,
  });
}

export function useGetAccountInfo(address: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getAccountInfo", address],
    queryFn: async () => {
      const connection = new Connection(endpoint, "processed");

      return await connection.getParsedAccountInfo(new PublicKey(address), {
        commitment: "processed",
      });
    },
    enabled,
  });
}

export function useGetBalance(address: string, enabled: boolean = true) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getBalance", address],
    queryFn: async () => {
      const connection = new Connection(endpoint, "processed");

      return await connection.getBalance(new PublicKey(address));
    },
    enabled,
  });
}

export function useGetSignaturesForAddress(
  address: string,
  limit: number = 10,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getSignaturesForAddress", address, limit],
    queryFn: async () => {
      const connection = new Connection(endpoint, "confirmed");

      return await connection.getSignaturesForAddress(new PublicKey(address), {
        limit,
      });
    },
    enabled,
  });
}

export function useGetParsedAccountInfo(
  publicKey: PublicKey,
  enabled: boolean = true,
) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getParsedAccountInfo", publicKey.toBase58()],
    queryFn: async () => {
      const connection = new Connection(endpoint, "confirmed");

      return await connection.getParsedAccountInfo(publicKey);
    },
    enabled,
  });
}

export function useGetRecentPerformanceSamples(options = {}) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getRecentPerformanceSamples"],
    queryFn: async () => {
      const connection = new Connection(endpoint, "processed");

      const performanceSamples =
        await connection.getRecentPerformanceSamples(1);
      const sample = performanceSamples[0];

      const totalTransactions = Number(sample.numTransactions);
      const samplePeriodSecs = sample.samplePeriodSecs;
      const avgTps = totalTransactions / samplePeriodSecs;

      const start = Date.now();
      await connection.getSlot();
      const end = Date.now();
      const latency = end - start;

      return { avgTps, latency };
    },
    ...options,
  });
}
