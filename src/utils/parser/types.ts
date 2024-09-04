import type { EnrichedTransaction } from "@/types/helius-sdk";
import { Source, TransactionType } from "@/types/helius-sdk";
import { TransactionError } from "@solana/web3.js";

import * as parser from "./parsers";

export const SOL = "So11111111111111111111111111111111111111112";

export enum ActionTypes {
  TRANSFER = "TRANSFER",
  SENT = "SENT",
  RECEIVED = "RECEIVED",
  BURNT = "BURNT",
  MINT = "MINT",
  CNFT_MINT = "CNFT_MINT",
  CNFT_TRANSFER = "CNFT_TRANSFER",
  NFT_SALE = "NFT_SALE",
  PAID = "PAID",
  BID = "BID",
  LIST = "LIST",
}

export enum ParserTransactionTypes {
  TRANSFER = "Transfer",
  SWAP = "Swap",
  BURN = "Burn",
  MINT = "Mint",
  UNKNOWN = "Unknown",
  TOKEN_MINT = "Token Mint",
  CNFT_MINT = "cNFT Mint",
  CNFT_TRANSFER = "cNFT Transfer",
  CNFT_BURN = "cNFT Burn",
  NFT_SALE = "NFT Sale",
  NFT_BID = "NFT Bid",
  NFT_LISTING = "NFT Listing",
  NFT_MINT = "NFT Mint",
  VOTE = "Vote",
}

type InstructionError = [number, string[]];

type TransactionErrorType = {
  InstructionError: InstructionError;
};

export type TransactionErrorOrNull = TransactionErrorType | null;

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
  fee?: number;
  feePayer?: string;
  slot?: number;
  tokenTransfers: XrayTokenTransfer[];
  nativeTransfers: XrayNativeTransfer[];
  transactionError?: TransactionErrorOrNull;
}
export interface XrayTokenTransfer {
  fromTokenAccount: string;
  toTokenAccount: string;
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  mint: string;
  tokenStandard: string;
}

export interface XrayNativeTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
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
  tokenTransfers: [],
  nativeTransfers: [],
  transactionError: null,
};

export const XrayParsers = {
  BURN: parser.parseBurn,
  BURN_NFT: parser.parseBurn,
  COMPRESSED_NFT_BURN: parser.parseCompressedNftBurn,
  COMPRESSED_NFT_MINT: parser.parseCNFTMint,
  COMPRESSED_NFT_TRANSFER: parser.parseCompressedNftTransfer,
  EXECUTE_TRANSACTION: parser.parseTransfer,
  // Current parser is out of date with bids
  //   NFT_BID: parser.parseNftBid,
  //   NFT_BID_CANCELLED: parser.parseNftCancelBid,
  //   NFT_CANCEL_LISTING: parser.parseNftCancelList,
  //   NFT_GLOBAL_BID: parser.parseNftGlobalBid,
  NFT_LISTING: parser.parseNftList,
  NFT_MINT: parser.parseNftMint,
  NFT_SALE: parser.parseNftSale,
  SWAP: parser.parseSwap,
  TOKEN_MINT: parser.parseTokenMint,
  TRANSFER: parser.parseTransfer,
  UNKNOWN: parser.parseUnknown,
};

export type XrayType = keyof typeof XrayParsers;
