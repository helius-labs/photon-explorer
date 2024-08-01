import type { EnrichedTransaction } from "@/types/helius-sdk";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import {
  ActionTypes,
  ParserTransactionTypes,
  SOL,
  type TransactionAction,
  type XrayTransaction,
} from "../types";

export const parseNftSale = (
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
      type: ParserTransactionTypes.NFT_SALE,
      source,
      timestamp,
      actions: [],
      description,
    };
  }

  const actions: TransactionAction[] = [];

  if (events.nft !== null) {
    actions.push({
      actionType: ActionTypes.NFT_SALE,
      from: events.nft.seller || "Unknown Seller",
      to: events.nft.buyer || "Unknown Buyer",
      amount: 1,
      mint: events.nft.nfts[0].mint || "",
    });
    actions.push({
      actionType: ActionTypes.PAID,
      from: events.nft.buyer || "Unknown Seller",
      to: events.nft.seller || "Unknown Buyer",
      amount: events.nft.amount,
      mint: "So11111111111111111111111111111111111111112",
    });
  }

  return {
    signature,
    account: feePayer,
    type: ParserTransactionTypes.NFT_SALE,
    source,
    timestamp,
    actions: actions,
    description,
  };
};
