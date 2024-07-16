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
  // console.log("SWAP");
  if ("swap" in events && events.swap !== null) {
    const { swap } = events;

    if ("tokenInputs" in swap && swap.tokenInputs.length > 0) {
      actions.push({
        actionType: ActionTypes.SENT,
        amount: Number(swap.tokenInputs[0].rawTokenAmount.tokenAmount),
        mint: swap.tokenInputs[0].mint,
        decimals: swap.tokenInputs[0].rawTokenAmount.decimals,
      });
    }

    if (swap.nativeOutput !== null) {
      actions.push({
        actionType: ActionTypes.RECEIVED,
        amount: Number(swap.nativeOutput.amount),
        mint: SOL,
      });
    }

    if (swap.nativeInput !== null) {
      actions.push({
        actionType: ActionTypes.SENT,
        amount: Number(swap.nativeInput.amount),
        mint: SOL,
      });
    }

    if ("tokenOutputs" in swap && swap.tokenOutputs.length > 0) {
      actions.push({
        actionType: ActionTypes.RECEIVED,
        amount: Number(swap.tokenOutputs[0].rawTokenAmount.tokenAmount),
        mint: swap.tokenOutputs[0].mint,
        decimals: swap.tokenOutputs[0].rawTokenAmount.decimals,
      });
    }
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
