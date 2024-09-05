"use client";

import { useCluster } from "@/providers/cluster-provider";
import { getParsedTransactions } from "@/server/getParsedTransactions";
import { Source } from "@/types/helius-sdk";
import { Cluster } from "@/utils/cluster";
import { lamportsToSolString } from "@/utils/common";
import {
  ParserTransactionTypes,
  TransactionErrorOrNull,
  XrayTransaction,
} from "@/utils/parser";
import {
  ConfirmedTransactionMeta,
  TransactionVersion,
  VOTE_PROGRAM_ID,
  VersionedMessage,
  VersionedTransactionResponse,
} from "@solana/web3.js";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useGetBlock } from "@/hooks/web3";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import Signature from "../common/signature";
import LottieLoader from "../common/lottie-loading";
import loadingBarAnimation from "@/../public/assets/animations/loadingBar.json";

type BlockTransaction = {
  transaction: {
    message: VersionedMessage;
    signatures: string[];
  };
  meta: ConfirmedTransactionMeta | null;
  version?: TransactionVersion;
};

type TransactionWithParsedInfo = {
  index: number;
  parsedInfo: XrayTransaction;
  slot: number;
  meta: ConfirmedTransactionMeta | null;
  signature: string;
  rawTransaction: BlockTransaction;
};

const ITEMS_PER_PAGE = 25;
const BATCH_SIZE = 100;

type TransactionStatus = "all" | "successful" | "failed";

export default function BlockHistory({ slot }: { slot: string }) {
  const { data: blockInfo, isLoading: isBlockLoading, isError } = useGetBlock(Number(slot));
  const [page, setPage] = useState(1);
  const [showVoteTransactions, setShowVoteTransactions] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("all");
  const { cluster } = useCluster();
  const [transactionState, setTransactionState] = useState<{
    parsedTransactions: TransactionWithParsedInfo[];
    isProcessing: boolean;
    processedCount: number;
    totalTransactions: number;
  }>({
    parsedTransactions: [],
    isProcessing: false,
    processedCount: 0,
    totalTransactions: 0,
  });

  const isVoteTransaction = useCallback(
    (transaction: VersionedTransactionResponse["transaction"]): boolean => {
      const message = transaction.message;
      if ("accountKeys" in message) {
        return message.accountKeys.some((key) => key.equals(VOTE_PROGRAM_ID));
      }
      if ("staticAccountKeys" in message) {
        return message.staticAccountKeys.some((key) =>
          key.equals(VOTE_PROGRAM_ID)
        );
      }
      return false;
    },
    []
  );

  const processTransactionBatch = useCallback(async (batch: BlockTransaction[]) => {
    try {
      const nonVoteTransactions = batch.filter(tx => !isVoteTransaction(tx.transaction));
      const signatures = nonVoteTransactions.map(tx => tx.transaction.signatures[0]);
      const parsedBatch = await getParsedTransactions(signatures, cluster as Cluster);
      console.log(`Batch size: ${batch.length}, Non-vote transactions: ${nonVoteTransactions.length}, Parsed transactions: ${parsedBatch?.length || 0}`);

      return batch.map((tx) => {
        if (isVoteTransaction(tx.transaction)) {
          return {
            index: 0,
            parsedInfo: {
              type: ParserTransactionTypes.VOTE,
              source: Source.VOTE_PROGRAM,
              signature: tx.transaction.signatures[0],
              fee: tx.meta?.fee || 0,
              timestamp: blockInfo!.blockTime ? blockInfo!.blockTime * 1000 : 0,
              slot: blockInfo!.parentSlot + 1,
              transactionError: tx.meta?.err as TransactionErrorOrNull || null,
              account: "",
              actions: [],
              tokenTransfers: [],
              nativeTransfers: [],
            },
            slot: blockInfo!.parentSlot + 1,
            meta: tx.meta,
            signature: tx.transaction.signatures[0],
            rawTransaction: tx,
          };
        }

        const parsedTx = parsedBatch?.find(p => p.signature === tx.transaction.signatures[0]);
        if (parsedTx) {
          return {
            index: 0,
            parsedInfo: {
              ...parsedTx,
              transactionError: tx.meta?.err as TransactionErrorOrNull || null,
            },
            slot: blockInfo!.parentSlot + 1,
            meta: tx.meta,
            signature: tx.transaction.signatures[0],
            rawTransaction: tx,
          };
        } else {
          console.warn(`Failed to parse transaction: ${tx.transaction.signatures[0]}`);
          return {
            index: 0,
            parsedInfo: {
              type: ParserTransactionTypes.UNKNOWN,
              source: Source.UNKNOWN,
              signature: tx.transaction.signatures[0],
              fee: tx.meta?.fee || 0,
              timestamp: blockInfo!.blockTime ? blockInfo!.blockTime * 1000 : 0,
              slot: blockInfo!.parentSlot + 1,
              transactionError: tx.meta?.err as TransactionErrorOrNull || null,
              account: "",
              actions: [],
              tokenTransfers: [],
              nativeTransfers: [],
            },
            slot: blockInfo!.parentSlot + 1,
            meta: tx.meta,
            signature: tx.transaction.signatures[0],
            rawTransaction: tx,
          };
        }
      });
    } catch (error) {
      console.error("Error processing batch:", error);
      return batch.map((tx) => ({
        index: 0,
        parsedInfo: {
          type: isVoteTransaction(tx.transaction) ? ParserTransactionTypes.VOTE : ParserTransactionTypes.UNKNOWN,
          source: isVoteTransaction(tx.transaction) ? Source.VOTE_PROGRAM : Source.UNKNOWN,
          signature: tx.transaction.signatures[0],
          fee: tx.meta?.fee || 0,
          timestamp: blockInfo!.blockTime ? blockInfo!.blockTime * 1000 : 0,
          slot: blockInfo!.parentSlot + 1,
          transactionError: tx.meta?.err as TransactionErrorOrNull || null,
          account: "",
          actions: [],
          tokenTransfers: [],
          nativeTransfers: [],
        },
        slot: blockInfo!.parentSlot + 1,
        meta: tx.meta,
        signature: tx.transaction.signatures[0],
        rawTransaction: tx,
      }));
    }
  }, [cluster, blockInfo, isVoteTransaction]);

  useEffect(() => {
    if (blockInfo && !transactionState.isProcessing) {
      const processTransactions = async () => {
        setTransactionState((prev) => ({ ...prev, isProcessing: true }));
        
        console.log(`Total transactions in block: ${blockInfo.transactions.length}`);

        let allParsedTransactions: TransactionWithParsedInfo[] = [];

        for (let i = 0; i < blockInfo.transactions.length; i += BATCH_SIZE) {
          const batch = blockInfo.transactions.slice(i, i + BATCH_SIZE);
          const parsedBatch = await processTransactionBatch(batch);
          allParsedTransactions = [...allParsedTransactions, ...parsedBatch];
          console.log(
            `Processed batch ${i / BATCH_SIZE + 1}, Total parsed: ${allParsedTransactions.length}`
          );
        }

        console.log(
          `Total parsed transactions: ${allParsedTransactions.length}`
        );

        setTransactionState((prev) => ({
          ...prev,
          parsedTransactions: allParsedTransactions,
          processedCount: allParsedTransactions.length,
          totalTransactions: blockInfo.transactions.length,
          isProcessing: false,
        }));
      };

      processTransactions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockInfo, cluster, processTransactionBatch]);

  const { filteredTransactions, totalTransactions } = useMemo(() => {
    let filtered = transactionState.parsedTransactions;

    console.log(`Total parsed transactions: ${filtered.length}`);
    console.log(
      `Total transactions in block: ${transactionState.totalTransactions}`
    );

    if (!showVoteTransactions) {
      filtered = filtered.filter(
        (tx) => tx.parsedInfo.type !== ParserTransactionTypes.VOTE
      );
      console.log(`Transactions after vote filtering: ${filtered.length}`);
    }

    if (transactionStatus !== "all") {
      filtered = filtered.filter((tx) =>
        transactionStatus === "successful"
          ? tx.parsedInfo.transactionError === null
          : tx.parsedInfo.transactionError !== null
      );
      console.log(
        `Transactions after status filtering (${transactionStatus}): ${filtered.length}`
      );
    }

    return {
      filteredTransactions: filtered,
      totalTransactions: filtered.length,
    };
  }, [
    transactionState.parsedTransactions,
    showVoteTransactions,
    transactionStatus,
    transactionState.totalTransactions,
  ]);

  const totalPages = Math.max(1, Math.ceil(totalTransactions / ITEMS_PER_PAGE));

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, page]);

  if (isBlockLoading || transactionState.isProcessing) {
    return (
      <div className="flex justify-center items-center h-64">
        <LottieLoader
          animationData={loadingBarAnimation}
          className="h-32 w-32"
        />
      </div>
    );
  }

  if (isError) return <div>Error loading block data</div>;

  return (
    <Card className="col-span-12 mx-[-1rem] mb-10 mt-10 overflow-hidden md:mx-0">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Transactions</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                Show Vote Transactions
              </span>
              <Switch
                checked={showVoteTransactions}
                onCheckedChange={setShowVoteTransactions}
              />
            </div>
            <Select
              value={transactionStatus}
              onValueChange={(value: TransactionStatus) =>
                setTransactionStatus(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 text-left text-sm font-medium text-gray-400">
                  Type
                </th>
                <th className="py-2 text-left text-sm font-medium text-gray-400">
                  Info
                </th>
                <th className="py-2 text-left text-sm font-medium text-gray-400">
                  Signature
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx) => (
                <tr key={tx.signature} className="border-b border-gray-700">
                  <td className="py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-white">
                        {tx.parsedInfo.type === ParserTransactionTypes.UNKNOWN
                          ? "Unknown"
                          : tx.parsedInfo.type}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    {tx.parsedInfo.type === ParserTransactionTypes.UNKNOWN ? (
                      <span className="text-yellow-500">Unable to parse</span>
                    ) : (
                      <>
                        <span
                          className={
                            tx.meta?.err ? "text-red-500" : "text-green-500"
                          }
                        >
                          {tx.meta?.err ? "Failed" : "Success"}
                        </span>
                        <span className="ml-2 text-sm text-gray-400">
                          {lamportsToSolString(tx.meta?.fee || 0)} SOL
                        </span>
                      </>
                    )}
                  </td>
                  <td className="py-4">
                    <Signature signature={tx.signature} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {paginatedTransactions.length} of {totalTransactions}{" "}
            transactions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
