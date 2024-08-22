import type { EnrichedTransaction } from "@/types/helius-sdk";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import {
  ActionTypes,
  ParserTransactionTypes,
  SOL,
  type TransactionAction,
  TransactionErrorOrNull,
  XrayNativeTransfer,
  XrayTokenTransfer,
  type XrayTransaction,
} from "../types";

export const parseTokenMint = (
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
      type: ParserTransactionTypes.MINT,
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

  if (tokenTransfers.length >= 1) {
    actions.push({
      actionType: ActionTypes.MINT,
      from: "MINT",
      to: tokenTransfers[0].toUserAccount!,
      amount: tokenTransfers[0].tokenAmount,
      mint: tokenTransfers[0].mint,
    });
  }

  return {
    signature,
    account: feePayer,
    type: ParserTransactionTypes.TOKEN_MINT,
    source,
    timestamp,
    actions: actions,
    description,
    tokenTransfers: tokenTransfers as XrayTokenTransfer[],
    nativeTransfers: nativeTransfers as XrayNativeTransfer[],
    transactionError: transactionError as TransactionErrorOrNull,
  };
};
