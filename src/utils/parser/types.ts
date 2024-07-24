import type { EnrichedTransaction } from "@/types/helius-sdk";
import { Source, TransactionType } from "@/types/helius-sdk";

import * as parser from "./parsers";

export const SOL = "So11111111111111111111111111111111111111112";

export enum ActionTypes {
  TRANSFER = "TRANSFER",
  SENT = "SENT",
  RECEIVED = "RECEIVED",
  BURNT = "BURNT",
  MINT = "MINT",
  CNFT_MINT = "CNFT MINT",
  CNFT_TRANSFER = "CNFT_TRANSFER",
}

export enum ParserTransactionTypes {
  TRANSFER = "TRANSFER",
  SWAP = "SWAP",
  BURN = "BURN",
  MINT = "MINT",
  UNKNOWN = "UNKNOWN",
  TOKEN_MINT = "TOKEN MINT",
  CNFT_MINT = "CNFT MINT",
  CNFT_TRANSFER = "CNFT TRANSFER",
}

export type XrayParser = (
  transaction: EnrichedTransaction,
  address?: string,
) => XrayTransaction;

export interface TransactionAction {
  actionType: ActionTypes;
  from?: string;
  to?: string;
  mint?: string;
  decimals?: number;
  amount: number;
}

export interface XrayTransaction {
  signature: string;
  account: string;
  timestamp: number;
  type: ParserTransactionTypes;
  source: Source;
  actions: TransactionAction[];
  description?: string;
}

export interface XrayAccount {
  account: string;
  changes: XrayAccountChange[];
}

export interface XrayAccountChange {
  mint: string;
  amount: number;
}

export type XrayParsers = Record<string, XrayParser>;

export const unknownXrayTransaction: XrayTransaction = {
  account: "",
  actions: [],
  signature: "",
  source: Source.SYSTEM_PROGRAM,
  timestamp: 0,
  type: ParserTransactionTypes.UNKNOWN,
};

export const XrayParsers = {
  BURN: parser.parseBurn,
  //   BURN_NFT: parser.parseBurn,
  //   COMPRESSED_NFT_BURN: parser.parseCompressedNftBurn,
  COMPRESSED_NFT_MINT: parser.parseCNFTMint,
  COMPRESSED_NFT_TRANSFER: parser.parseCompressedNftTransfer,
  EXECUTE_TRANSACTION: parser.parseTransfer,
  //   NFT_BID: parser.parseNftBid,
  //   NFT_BID_CANCELLED: parser.parseNftCancelBid,
  //   NFT_CANCEL_LISTING: parser.parseNftCancelList,
  //   NFT_GLOBAL_BID: parser.parseNftGlobalBid,
  //   NFT_LISTING: parser.parseNftList,
  //   NFT_MINT: parser.parseNftMint,
  //   NFT_SALE: parser.parseNftSale,
  SWAP: parser.parseSwap,
  TOKEN_MINT: parser.parseTokenMint,
  TRANSFER: parser.parseTransfer,
  UNKNOWN: parser.parseUnknown,
};

export type XrayType = keyof typeof XrayParsers;
