import type { EnrichedTransaction } from "@/types/helius-sdk";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import {
  ActionTypes,
  ParserTransactionTypes,
  SOL,
  type TransactionAction,
  XrayNativeTransfer,
  XrayTokenTransfer,
  type XrayTransaction,
} from "../types";

export const parseCompressedNftBurn = (
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
  } = transaction;

  if (tokenTransfers === null || nativeTransfers === null) {
    return {
      signature,
      account: feePayer,
      type: ParserTransactionTypes.CNFT_BURN,
      source,
      timestamp,
      actions: [],
      description,
      tokenTransfers: tokenTransfers as XrayTokenTransfer[],
      nativeTransfers: nativeTransfers as XrayNativeTransfer[],
    };
  }

  const actions: TransactionAction[] = [];

  if (events.compressed !== null) {
    actions.push({
      actionType: ActionTypes.BURNT,
      from: feePayer || "UNKNOWN",
      to: "BURN",
      amount: 1,
      mint: events.compressed[0]?.assetId || "",
    });
  }

  return {
    signature,
    account: feePayer,
    type: ParserTransactionTypes.CNFT_BURN,
    source,
    timestamp,
    actions: actions,
    description,
    tokenTransfers: tokenTransfers as XrayTokenTransfer[],
    nativeTransfers: nativeTransfers as XrayNativeTransfer[],
  };
};
