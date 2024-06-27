import type { EnrichedTransaction } from "@/types/helius-sdk";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import {
  ActionTypes,
  ParserTransactionTypes,
  SOL,
  type TransactionAction,
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
    };
  }

  const actions: TransactionAction[] = [];

  if (nativeTransfers.length === 1) {
    actions.push({
      actionType: ActionTypes.TRANSFER,
      from: nativeTransfers[0].fromUserAccount!,
      to: nativeTransfers[0].toUserAccount!,
      amount: nativeTransfers[0].amount,
      mint: SOL,
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
  };
};
