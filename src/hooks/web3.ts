"use client";

import { useCluster } from "@/providers/cluster-provider";
import { getTokenPrices } from "@/server/getTokenPrice";
import { Connection, PublicKey, VersionedBlockResponse } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

interface ExtendedBlockInfo extends VersionedBlockResponse {
  blockLeader?: PublicKey;
  childSlot?: number;
  childLeader?: PublicKey;
  parentLeader?: PublicKey;
}

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

  return useQuery<ExtendedBlockInfo, Error>({
    queryKey: [endpoint, "getBlock", slot],
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
    staleTime: 1000 * 60 * 60,
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

  return useQuery<number, Error>({
    queryKey: [endpoint, "getBalance", address],
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

async function fetchSolPrice(): Promise<number> {
  const ids = ["So11111111111111111111111111111111111111112"];
  const tokenPrices = await getTokenPrices(ids);

  if (tokenPrices && tokenPrices.data[ids[0]]) {
    return tokenPrices.data[ids[0]].price;
  } else {
    throw new Error("Failed to fetch SOL price");
  }
}

export function useGetSolPrice() {
  return useQuery<number, Error>({
    queryKey: ["solPrice"],
    queryFn: fetchSolPrice,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGetSignaturesForAddress(
  address: string,
  limit: number = 10,
  enabled: boolean = true,
  before?: string,
) {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getSignaturesForAddress", address, limit, before],
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

export function useGetEpochInfo() {
  const { endpoint } = useCluster();

  return useQuery({
    queryKey: [endpoint, "getEpochInfo"],
    queryFn: async () => {
      const connection = new Connection(endpoint, "confirmed");
      return await connection.getEpochInfo();
    },
  });
}