import { PublicKey } from "@solana/web3.js";
import { ArrowRightLeftIcon } from "lucide-react";
import React from "react";

import {
  ParserTransactionTypes,
  XrayTransaction,
} from "../../utils/parser/types";
import { TokenBalance } from "./token-balance";

function transactionBreakdown(transaction: XrayTransaction) {
  switch (transaction.type) {
    case ParserTransactionTypes.TRANSFER:
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <p style={{ margin: 0, marginRight: "8px" }}>Transferred</p>
          {transaction?.actions[0]?.mint && (
            <TokenBalance
              amount={transaction.actions[0].amount}
              decimals={transaction.actions[0].decimals}
              mint={new PublicKey(transaction.actions[0].mint)}
              isReadable={true}
            />
          )}
        </div>
      );
    case ParserTransactionTypes.SWAP:
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* <p style={{ margin: 0, marginRight: "8px" }}>Swapped </p> */}
          {transaction?.actions[0]?.mint && (
            <TokenBalance
              amount={transaction.actions[0].amount}
              decimals={transaction.actions[0].decimals}
              mint={new PublicKey(transaction?.actions[0]?.mint)}
              isReadable={false}
            />
          )}
          <ArrowRightLeftIcon className="mx-3 h-6 w-6" />
          {transaction?.actions[1]?.mint && (
            <TokenBalance
              amount={transaction.actions[1].amount}
              decimals={transaction.actions[1].decimals}
              mint={new PublicKey(transaction?.actions[1]?.mint)}
              isReadable={false}
            />
          )}
        </div>
      );
  }
  return "Unknown transaction type";
}

export default transactionBreakdown;
