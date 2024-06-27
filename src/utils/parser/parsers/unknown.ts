import type { EnrichedTransaction } from "@/types/helius-sdk";

import { ParserTransactionTypes, type XrayTransaction } from "../types";

export const parseUnknown = (
  transaction: EnrichedTransaction,
  address: string | undefined,
): XrayTransaction => {
  const {
    signature,
    timestamp,
    type,
    source,
    accountData,
    tokenTransfers,
    nativeTransfers,
    instructions,
    feePayer,
    description,
  } = transaction;

  return {
    signature,
    account: feePayer,
    type: ParserTransactionTypes.UNKNOWN,
    source,
    timestamp,
    actions: [],
    description,
  };
};
