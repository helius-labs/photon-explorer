import type { EnrichedTransaction } from "@/types/helius-sdk";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import {
  ActionTypes,
  ParserTransactionTypes,
  SOL,
  type TransactionAction,
  type XrayTransaction,
} from "../types";

export const parseBurn = (
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
  } = transaction;

  if (tokenTransfers === null || nativeTransfers === null) {
    return {
      signature,
      account: feePayer,
      type: ParserTransactionTypes.BURN,
      source,
      timestamp,
      actions: [],
      description,
    };
  }

  const actions: TransactionAction[] = [];

  if (tokenTransfers.length >= 1) {
    actions.push({
      actionType: ActionTypes.BURNT,
      from: tokenTransfers[0].fromUserAccount!,
      to: "BURN",
      amount: tokenTransfers[0].tokenAmount,
      mint: tokenTransfers[0].mint,
    });
  }

  return {
    signature,
    account: feePayer,
    type: ParserTransactionTypes.BURN,
    source,
    timestamp,
    actions: actions,
    description,
  };
};
