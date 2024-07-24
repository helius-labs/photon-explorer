import type { EnrichedTransaction } from "@/types/helius-sdk";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import {
  ActionTypes,
  ParserTransactionTypes,
  SOL,
  type TransactionAction,
  type XrayTransaction,
} from "../types";

export const parseCNFTMint = (
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
      type: ParserTransactionTypes.CNFT_MINT,
      source,
      timestamp,
      actions: [],
      description,
    };
  }

  const actions: TransactionAction[] = [];

  if (events.compressed !== null) {
    actions.push({
      actionType: ActionTypes.CNFT_MINT,
      from: events.compressed[0]?.metadata?.creators?.[0]?.address || "UNKNOWN",
      to: events.compressed[0]?.newLeafOwner || "UNKNOWN",
      amount: 1,
      mint: events.compressed[0]?.assetId || "",
    });
  }

  return {
    signature,
    account: feePayer,
    type: ParserTransactionTypes.CNFT_MINT,
    source,
    timestamp,
    actions: actions,
    description,
  };
};
