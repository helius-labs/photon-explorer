"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { lamportsToSolString } from "@/utils/common";
import { VOTE_PROGRAM_ID, ConfirmedTransactionMeta, VersionedTransactionResponse } from "@solana/web3.js";
import { useGetBlock } from "@/hooks/web3";
import Signature from "../common/signature";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { XrayTransaction, ParserTransactionTypes, TransactionErrorOrNull } from "@/utils/parser";
import { getParsedTransactions } from "@/server/getParsedTransactions";
import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { Source } from "@/types/helius-sdk";

type TransactionWithParsedInfo = {
  index: number;
  parsedInfo: XrayTransaction;
  slot: number;
  meta: ConfirmedTransactionMeta | null;
  signature: string;
};

const ITEMS_PER_PAGE = 25;
const BATCH_SIZE = 100;

type TransactionStatus = "all" | "successful" | "failed";

export default function BlockHistory({ slot }: { slot: string }) {
  const { data: blockInfo, isLoading, isError } = useGetBlock(Number(slot));
  const [page, setPage] = useState(1);
  const [showVoteTransactions, setShowVoteTransactions] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('all');
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

  const isVoteTransaction = useCallback((transaction: VersionedTransactionResponse["transaction"]): boolean => {
    const message = transaction.message;
    if ("accountKeys" in message) {
      return message.accountKeys.some(key => key.equals(VOTE_PROGRAM_ID));
    }
    if ("staticAccountKeys" in message) {
      return message.staticAccountKeys.some(key => key.equals(VOTE_PROGRAM_ID));
    }
    return false;
  }, []);

  const processTransactionBatch = useCallback(async (batch: string[]) => {
    try {
      const parsedBatch = await getParsedTransactions(batch, cluster as Cluster);
      if (parsedBatch) {
        console.log(`Processed batch of ${parsedBatch.length} transactions`);
        return parsedBatch.map((tx) => {
          const originalTx = blockInfo!.transactions.find(t => t.transaction.signatures[0] === tx.signature);
          return {
            index: 0, // We'll set this later when we know the final order
            parsedInfo: {
              ...tx,
              transactionError: originalTx?.meta?.err as TransactionErrorOrNull || null,
            },
            slot: blockInfo!.parentSlot + 1,
            meta: originalTx?.meta || null,
            signature: tx.signature,
          };
        });
      }
      return [];
    } catch (error) {
      console.error("Error processing batch:", error);
      return [];
    }
  }, [cluster, blockInfo]);

  useEffect(() => {
    if (blockInfo && !transactionState.isProcessing) {
      const processTransactions = async () => {
        setTransactionState(prev => ({ ...prev, isProcessing: true }));
        const voteTransactions: TransactionWithParsedInfo[] = [];
        const nonVoteTransactions: string[] = [];

        blockInfo.transactions.forEach((tx, index) => {
          if (isVoteTransaction(tx.transaction)) {
            voteTransactions.push({
              index,
              parsedInfo: {
                type: ParserTransactionTypes.VOTE,
                source: Source.VOTE_PROGRAM,
                signature: tx.transaction.signatures[0],
                fee: tx.meta?.fee || 0,
                timestamp: blockInfo.blockTime ? blockInfo.blockTime * 1000 : 0,
                slot: blockInfo.parentSlot + 1,
                transactionError: tx.meta?.err as TransactionErrorOrNull || null,
                account: "",
                actions: [],
                tokenTransfers: [],
                nativeTransfers: [],
              },
              slot: blockInfo.parentSlot + 1,
              meta: tx.meta,
              signature: tx.transaction.signatures[0],
            });
          } else {
            nonVoteTransactions.push(tx.transaction.signatures[0]);
          }
        });

        console.log(`Vote transactions: ${voteTransactions.length}`);
        console.log(`Non-vote transactions: ${nonVoteTransactions.length}`);

        let allParsedTransactions = [...voteTransactions];

        for (let i = 0; i < nonVoteTransactions.length; i += BATCH_SIZE) {
          const batch = nonVoteTransactions.slice(i, i + BATCH_SIZE);
          const parsedBatch = await processTransactionBatch(batch);
          allParsedTransactions = [...allParsedTransactions, ...parsedBatch];
        }

        // Sort transactions based on their original order in the block
        allParsedTransactions.sort((a, b) => {
          const indexA = blockInfo.transactions.findIndex(tx => tx.transaction.signatures[0] === a.signature);
          const indexB = blockInfo.transactions.findIndex(tx => tx.transaction.signatures[0] === b.signature);
          return indexA - indexB;
        });

        // Update indices after sorting
        allParsedTransactions = allParsedTransactions.map((tx, index) => ({
          ...tx,
          index,
        }));

        setTransactionState(prev => ({
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
  }, [blockInfo, cluster, isVoteTransaction, processTransactionBatch]);

  const { filteredTransactions, totalTransactions } = useMemo(() => {
    let filtered = transactionState.parsedTransactions;

    console.log(`Total parsed transactions: ${filtered.length}`);
    console.log(`Total transactions in block: ${transactionState.totalTransactions}`);

    if (!showVoteTransactions) {
      filtered = filtered.filter(tx => tx.parsedInfo.type !== ParserTransactionTypes.VOTE);
      console.log(`Transactions after vote filtering: ${filtered.length}`);
    }

    if (transactionStatus !== 'all') {
      filtered = filtered.filter(tx => 
        transactionStatus === 'successful' ? tx.parsedInfo.transactionError === null : tx.parsedInfo.transactionError !== null
      );
      console.log(`Transactions after status filtering (${transactionStatus}): ${filtered.length}`);
    }

    return { 
      filteredTransactions: filtered, 
      totalTransactions: filtered.length,
    };
  }, [transactionState.parsedTransactions, showVoteTransactions, transactionStatus, transactionState.totalTransactions]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, page]);

  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading block data</div>;

  return (
    <Card className="col-span-12 mx-[-1rem] mb-10 mt-10 overflow-hidden md:mx-0">
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Transactions</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Show Vote Transactions</span>
              <Switch
                checked={showVoteTransactions}
                onCheckedChange={setShowVoteTransactions}
              />
            </div>
            <Select
              value={transactionStatus}
              onValueChange={(value: TransactionStatus) => setTransactionStatus(value)}
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
                <th className="py-2 text-left text-sm font-medium text-gray-400">Type</th>
                <th className="py-2 text-left text-sm font-medium text-gray-400">Info</th>
                <th className="py-2 text-left text-sm font-medium text-gray-400">Signature</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx) => (
                <tr key={tx.signature} className="border-b border-gray-700">
                  <td className="py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-white">{tx.parsedInfo.type}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={tx.meta?.err ? "text-red-500" : "text-green-500"}>
                      {tx.meta?.err ? "Failed" : "Success"}
                    </span>
                    <span className="ml-2 text-sm text-gray-400">
                      {lamportsToSolString(tx.meta?.fee || 0)} SOL
                    </span>
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
            Showing {paginatedTransactions.length} of {totalTransactions} transactions
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