"use client";

import { lamportsToSolString } from "@/utils/common";
import {
  ConfirmedTransactionMeta,
  PublicKey,
  TransactionSignature,
  VOTE_PROGRAM_ID,
} from "@solana/web3.js";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { useGetBlock } from "@/hooks/web3";

import Address from "../common/address";
import Signature from "../common/signature";
import { DataTable } from "../data-table/data-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";

type TransactionWithInvocations = {
  index: number;
  signature?: TransactionSignature;
  meta: ConfirmedTransactionMeta | null;
  invocations: Map<string, number>;
};

const columns: ColumnDef<TransactionWithInvocations>[] = [
  {
    accessorKey: "index",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => row.getValue("index"),
    enableSorting: true,
  },
  {
    accessorKey: "signature",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Signature" />
    ),
    cell: ({ row }) => <Signature signature={row.getValue("signature")} />,
    enableSorting: true,
  },
];

export default function BlockHistory({ slot }: { slot: string }) {
  const { data: block, isLoading, isError } = useGetBlock(Number(slot));

  const { transactions } = useMemo(() => {
    const invokedPrograms = new Map<string, number>();

    if (!block) {
      return { transactions: [] };
    }

    const transactions: TransactionWithInvocations[] = block.transactions.map(
      (tx, index) => {
        let signature: TransactionSignature | undefined;
        if (tx.transaction.signatures.length > 0) {
          signature = tx.transaction.signatures[0];
        }

        const programIndexes = tx.transaction.message.compiledInstructions
          .map((ix) => ix.programIdIndex)
          .concat(
            tx.meta?.innerInstructions?.flatMap((ix) => {
              return ix.instructions.map((ix) => ix.programIdIndex);
            }) || [],
          );

        const indexMap = new Map<number, number>();
        programIndexes.forEach((programIndex) => {
          const count = indexMap.get(programIndex) || 0;
          indexMap.set(programIndex, count + 1);
        });

        const invocations = new Map<string, number>();
        const accountKeys = tx.transaction.message.getAccountKeys({
          accountKeysFromLookups: tx.meta?.loadedAddresses,
        });
        indexMap.forEach((count, i) => {
          const programId = accountKeys.get(i)!.toBase58();
          invocations.set(programId, count);
          const programTransactionCount = invokedPrograms.get(programId) || 0;
          invokedPrograms.set(programId, programTransactionCount + 1);
        });

        return {
          index,
          invocations,
          meta: tx.meta,
          signature,
        };
      },
    );
    return { transactions };
  }, [block]);

  const [filteredTransactions] = useMemo((): [TransactionWithInvocations[]] => {
    const voteFilter = VOTE_PROGRAM_ID.toBase58();
    const filteredTxs: TransactionWithInvocations[] = transactions.filter(
      ({ invocations }) => {
        // hide vote txs that don't invoke any other programs
        return !(invocations.has(voteFilter) && invocations.size === 1);
      },
    );

    return [filteredTxs];
  }, [transactions]);

  return <DataTable columns={columns} data={filteredTransactions} />;
}
