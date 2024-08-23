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

export const parseNftList = (
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
      type: ParserTransactionTypes.NFT_LISTING,
      source,
      timestamp,
      actions: [],
      description,
      tokenTransfers: tokenTransfers as XrayTokenTransfer[],
      nativeTransfers: nativeTransfers as XrayNativeTransfer[],
    };
  }

  const actions: TransactionAction[] = [];

  if (events.nft !== null) {
    actions.push({
      actionType: ActionTypes.LIST,
      from: events.nft.seller || "Unknown Seller",
      to: "",
      amount: events.nft.amount || 0,
      mint: events.nft.nfts[0].mint || "",
    });
  }

  return {
    signature,
    account: feePayer,
    type: ParserTransactionTypes.NFT_LISTING,
    source,
    timestamp,
    actions: actions,
    description,
    tokenTransfers: tokenTransfers as XrayTokenTransfer[],
    nativeTransfers: nativeTransfers as XrayNativeTransfer[],
  };
};
