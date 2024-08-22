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

export const parseCompressedNftTransfer = (
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
    events,
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
      tokenTransfers: tokenTransfers as XrayTokenTransfer[],
      nativeTransfers: nativeTransfers as XrayNativeTransfer[],
      transactionError: transactionError as TransactionErrorOrNull,
    };
  }

  const actions: TransactionAction[] = [];

  if (events.compressed !== null) {
    actions.push({
      actionType: ActionTypes.CNFT_TRANSFER,
      from: events.compressed[0]?.oldLeafOwner || "UNKNOWN SOURCE",
      to: events.compressed[0]?.newLeafOwner || "UNKNOWN DESTINATION",
      amount: 1,
      mint: events.compressed[0]?.assetId || "",
    });
  }

  return {
    signature,
    account: feePayer,
    type: ParserTransactionTypes.CNFT_TRANSFER,
    source,
    timestamp,
    actions: actions,
    description,
    tokenTransfers: tokenTransfers as XrayTokenTransfer[],
    nativeTransfers: nativeTransfers as XrayNativeTransfer[],
    transactionError: transactionError as TransactionErrorOrNull,
  };
};
