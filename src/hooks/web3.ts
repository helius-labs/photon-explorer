"use client";

import { useCluster } from "@/providers/cluster-provider";
import { Connection, PublicKey, VersionedBlockResponse } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

interface ExtendedBlockInfo extends VersionedBlockResponse {
  blockLeader?: PublicKey;
  childSlot?: number;
  childLeader?: PublicKey;
  parentLeader?: PublicKey;
}

export function useGetSlot(enabled: boolean = true) {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getSlot"],
    queryFn: async () => {
      const connection = new Connection(endpoint, "processed");

      return await connection.getSlot();
    },
    enabled,
  });
}

export function useGetBlock(slot: number, enabled: boolean = true) {
  const { cluster, endpoint } = useCluster();

  return useQuery<ExtendedBlockInfo, Error>({
    queryKey: [cluster, endpoint, "getBlock", slot],
    queryFn: async () => {
      const connection = new Connection(endpoint, "confirmed");

      const block = await connection.getBlock(Number(slot), {
        maxSupportedTransactionVersion: 0,
      });

      if (!block) {
        throw new Error("Block not found");
      }

      const childSlot = (await connection.getBlocks(slot + 1, slot + 100)).shift();
      const firstLeaderSlot = block.parentSlot;
      let leaders: PublicKey[] = [];

      try {
        const lastLeaderSlot = childSlot !== undefined ? childSlot : slot;
        const slotLeadersLimit = lastLeaderSlot - block.parentSlot + 1;
        leaders = await connection.getSlotLeaders(firstLeaderSlot, slotLeadersLimit);
      } catch (err) {
        console.error('Error fetching slot leaders:', err);
      }

      const getLeader = (leaderSlot: number) => {
        return leaders[leaderSlot - firstLeaderSlot];
      };

      return {
        ...block,
        blockLeader: getLeader(slot),
        childLeader: childSlot !== undefined ? getLeader(childSlot) : undefined,
        childSlot,
        parentLeader: getLeader(block.parentSlot),
      };
    },
    enabled,
  });
}

export function useGetTransaction(signature: string, enabled: boolean = true) {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getTransaction", signature],
    queryFn: async () => {
      const connection = new Connection(endpoint, "confirmed");

      return await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
    },
    enabled,
    staleTime: 1000 * 60 * 60,
  });
}

export function useGetSignatureStatus(
  signature: string,
  enabled: boolean = true,
) {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getSignatureStatus", signature],
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
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getAccountInfo", address],
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
  const { cluster, endpoint } = useCluster();

  return useQuery<number, Error>({
    queryKey: [cluster, endpoint, "getBalance", address],
    queryFn: async () => {
      const connection = new Connection(endpoint, "processed");
      return await connection.getBalance(new PublicKey(address));
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      console.error(`Error fetching balance (attempt ${failureCount}):`, error);
      return failureCount < 3;
    },
  });
}

export function useGetSignaturesForAddress(
  address: string,
  limit: number = 10,
  enabled: boolean = true,
  before?: string,
) {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getSignaturesForAddress", address, limit, before],
    queryFn: async () => {
      const connection = new Connection(endpoint, "confirmed");

      return await connection.getSignaturesForAddress(new PublicKey(address), {
        limit,
        before,
      });
    },
    enabled,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
}

export function useGetParsedAccountInfo(
  publicKey: PublicKey,
  enabled: boolean = true,
) {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getParsedAccountInfo", publicKey.toBase58()],
    queryFn: async () => {
      const connection = new Connection(endpoint, "confirmed");

      return await connection.getParsedAccountInfo(publicKey);
    },
    enabled,
  });
}

export function useGetRecentPerformanceSamples(options = {}) {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getRecentPerformanceSamples"],
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

export function useGetEpochInfo() {
  const { cluster, endpoint } = useCluster();

  return useQuery({
    queryKey: [cluster, endpoint, "getEpochInfo"],
    queryFn: async () => {
      const connection = new Connection(endpoint, "confirmed");
      return await connection.getEpochInfo();
    },
  });
}
