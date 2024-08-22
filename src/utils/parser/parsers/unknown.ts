import type { EnrichedTransaction } from "@/types/helius-sdk";

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

export const parseUnknown = (
  transaction: EnrichedTransaction,
  address: string | undefined,
): XrayTransaction => {
  const {
    signature,
    timestamp,
    type,
    source,
    accountData,
    tokenTransfers,
    nativeTransfers,
    instructions,
    feePayer,
    description,
    transactionError,
  } = transaction;

  if (tokenTransfers === null || nativeTransfers === null) {
    return {
      signature,
      account: feePayer,
      type: ParserTransactionTypes.UNKNOWN,
      source,
      timestamp,
      actions: [],
      description,
      tokenTransfers: tokenTransfers as XrayTokenTransfer[],
      nativeTransfers: nativeTransfers as XrayNativeTransfer[],
      transactionError: transactionError as TransactionErrorOrNull,
    };
  }

  //trying to add more details for unknown transactions
  // const actions: TransactionAction[] = [];
  // nativeTransfers.forEach((transfer) => {
  //   actions.push({
  //     actionType: ActionTypes.TRANSFER,
  //     from: transfer.fromUserAccount!,
  //     to: transfer.toUserAccount!,
  //     amount: transfer.amount,
  //     mint: SOL,
  //   });
  // });

  // tokenTransfers.forEach((transfer) => {
  //   actions.push({
  //     actionType: ActionTypes.TRANSFER,
  //     from: transfer.fromUserAccount!,
  //     to: transfer.toUserAccount!,
  //     amount: transfer.tokenAmount,
  //     mint: transfer.mint,
  //   });
  // });

  return {
    signature,
    account: feePayer,
    type: ParserTransactionTypes.UNKNOWN,
    source,
    timestamp,
    actions: [],
    description,
    tokenTransfers: tokenTransfers as XrayTokenTransfer[],
    nativeTransfers: nativeTransfers as XrayNativeTransfer[],
    transactionError: transactionError as TransactionErrorOrNull,
  };
};
