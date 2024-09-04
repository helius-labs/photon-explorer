import type { XrayParser, XrayType } from "./types";
import { XrayParsers } from "./types";

export * from "./types";

export const parseTransaction: XrayParser = (transaction, address) => {

  let parser: XrayParser = XrayParsers.UNKNOWN;
  var transactionType = transaction.type as XrayType;

  if (typeof XrayParsers[transactionType] === "undefined") {
    return XrayParsers.UNKNOWN(transaction, address);
  }

  parser = XrayParsers[transactionType];

  try {
    const result = parser(transaction, address);
    return result;
  } catch (error) {
    return XrayParsers.UNKNOWN(transaction, address);
  }
};
