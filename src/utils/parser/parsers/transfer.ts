import type { EnrichedTransaction } from "@/types/helius-sdk";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { X } from "lucide-react";

import {
  ActionTypes,
  ParserTransactionTypes,
  SOL,
  type TransactionAction,
  TransactionErrorOrNull,
  type XrayNativeTransfer,
  type XrayTokenTransfer,
  type XrayTransaction,
} from "../types";

export const parseTransfer = (
  transaction: EnrichedTransaction,
  address: string | undefined,
): XrayTransaction => {
  const {
    signature,
    timestamp,
    accountData,
    tokenTransfers,
    nativeTransfers,
    type,
    source,
    feePayer,
    description,
    transactionError,
  } = transaction;

  if (tokenTransfers === null || nativeTransfers === null) {
    return {
      signature,
      account: feePayer,
      type: ParserTransactionTypes.TRANSFER,
      source,
      timestamp,
      actions: [],
      description,
      tokenTransfers: [],
      nativeTransfers: [],
      transactionError: transactionError as TransactionErrorOrNull,
    };
  }

  const actions: TransactionAction[] = [];

  if (nativeTransfers.length === 1) {
    actions.push({
      actionType: ActionTypes.TRANSFER,
      from: nativeTransfers[0].fromUserAccount!,
      to: nativeTransfers[0].toUserAccount!,
      amount: nativeTransfers[0].amount / LAMPORTS_PER_SOL,
      mint: SOL,
    });
  }
  if (tokenTransfers.length >= 1) {
    actions.push({
      actionType: ActionTypes.TRANSFER,
      from: tokenTransfers[0].fromUserAccount!,
      to: tokenTransfers[0].toUserAccount!,
      amount: tokenTransfers[0].tokenAmount,
      mint: tokenTransfers[0].mint,
    });
  }

  return {
    signature,
    account: feePayer,
    type: ParserTransactionTypes.TRANSFER,
    source,
    timestamp,
    actions: actions,
    description,
    tokenTransfers: tokenTransfers as XrayTokenTransfer[],
    nativeTransfers: nativeTransfers as XrayNativeTransfer[],
    transactionError: transactionError as TransactionErrorOrNull,
  };
};
