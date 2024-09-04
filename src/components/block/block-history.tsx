"use client";

import React, { useMemo, useState } from "react";
import { lamportsToSolString } from "@/utils/common";
import {
  VOTE_PROGRAM_ID,
  VersionedTransactionResponse,
} from "@solana/web3.js";
import { useGetBlock } from "@/hooks/web3";
import Signature from "../common/signature";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { parseTransaction, XrayTransaction, ParserTransactionTypes } from "@/utils/parser";

type TransactionWithParsedInfo = Omit<VersionedTransactionResponse, 'slot'> & {
  index: number;
  parsedInfo: XrayTransaction;
  slot: number;
};

const ITEMS_PER_PAGE = 25;

type TransactionStatus = 'all' | 'successful' | 'failed';

export default function BlockHistory({ slot }: { slot: string }) {
  const { data: blockInfo, isLoading, isError } = useGetBlock(Number(slot));
  const [page, setPage] = useState(1);
  const [showVoteTransactions, setShowVoteTransactions] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('all');

  const { transactions, totalTransactions, blockTime } = useMemo(() => {
    if (!blockInfo) {
      return { transactions: [], totalTransactions: 0, blockTime: 0 };
    }
    const allTransactions: TransactionWithParsedInfo[] = blockInfo.transactions.map(
      (tx, index) => {
        let parsedInfo: XrayTransaction;

        try {
          parsedInfo = parseTransaction(tx as any);
        } catch (error) {
          console.error("Error parsing transaction:", error);
          parsedInfo = {
            type: ParserTransactionTypes.UNKNOWN,
          } as XrayTransaction;
        }

        return {
          ...tx,
          index,
          parsedInfo,
          slot: blockInfo.parentSlot + 1,
        };
      }
    );

    let filteredTransactions = allTransactions;

    if (!showVoteTransactions) {
      filteredTransactions = filteredTransactions.filter(tx => !isVoteTransaction(tx));
    }

    if (transactionStatus !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => 
        transactionStatus === 'successful' ? !tx.meta?.err : !!tx.meta?.err
      );
    }

    return { 
      transactions: filteredTransactions, 
      totalTransactions: filteredTransactions.length,
      blockTime: blockInfo.blockTime || 0
    };
  }, [blockInfo, showVoteTransactions, transactionStatus]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [transactions, page]);

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
                <tr key={tx.transaction.signatures[0]} className="border-b border-gray-700">
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
                    <Signature signature={tx.transaction.signatures[0]} />
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

const isVoteTransaction = (tx: TransactionWithParsedInfo): boolean => {
  const message = tx.transaction.message;
  
  // For legacy transactions
  if ('accountKeys' in message) {
    return message.accountKeys.some(key => key.equals(VOTE_PROGRAM_ID));
  }
  
  // For versioned transactions
  if ('staticAccountKeys' in message) {
    return message.staticAccountKeys.some(key => key.equals(VOTE_PROGRAM_ID));
  }

  return false;
};