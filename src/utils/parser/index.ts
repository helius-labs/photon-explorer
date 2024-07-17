import type { XrayParser, XrayType } from "./types";
import { XrayParsers } from "./types";

export * from "./types";

export const parseTransaction: XrayParser = (transaction, address) => {
  let parser: XrayParser = XrayParsers.UNKNOWN;

  var transactionType = transaction.type as XrayType;
  // console.log("starting txn type: ", transactionType);

  if (typeof XrayParsers[transactionType] === "undefined") {
    // console.log("Unknown transaction type (UNDEFINED): ", transactionType);
    return XrayParsers.UNKNOWN(transaction, address);
  }

  parser = XrayParsers[transactionType];

  try {
    return parser(transaction, address);
  } catch (error) {
    // eslint-disable-next-line no-console

    console.log(error);

    return XrayParsers.UNKNOWN(transaction, address);
  }
};
