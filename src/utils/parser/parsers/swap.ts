import type { EnrichedTransaction } from "@/types/helius-sdk";

import {
  ActionTypes,
  ParserTransactionTypes,
  SOL,
  type TransactionAction,
  type XrayTransaction,
} from "../types";

export const parseSwap = (
  transaction: EnrichedTransaction,
  address: string | undefined,
): XrayTransaction => {
  const {
    source,
    signature,
    timestamp,
    tokenTransfers,
    nativeTransfers,
    events,
    description,
    feePayer,
  } = transaction;

  // If the transaction is not a SWAP, return UNKNOWN
  if (tokenTransfers === null || nativeTransfers === null) {
    return {
      signature,
      account: feePayer,
      type: ParserTransactionTypes.SWAP,
      source,
      timestamp,
      actions: [],
      description,
    };
  }

  const actions: TransactionAction[] = [];

  if ("swap" in events && "tokenInputs" in events.swap!) {
    actions.push({
      actionType: ActionTypes.SENT,
      amount: Number(events.swap.tokenInputs[0].rawTokenAmount.tokenAmount),
      mint: events.swap.tokenInputs[0].mint,
      decimals: events.swap.tokenInputs[0].rawTokenAmount.decimals,
    });
  }
  if ("swap" in events && "nativeOutput" in events.swap!) {
    actions.push({
      actionType: ActionTypes.RECEIVED,
      amount: nativeTransfers[0].amount,
      mint: SOL,
    });
  }

  return {
    signature,
    account: feePayer,
    type: ParserTransactionTypes.SWAP,
    source,
    timestamp,
    actions,
    description,
  };
};
