import { AccountType, getAccountType } from "@/utils/account";
import { PublicKey } from "@solana/web3.js";
import { ArrowRightLeftIcon } from "lucide-react";
import React from "react";

import {
  ParserTransactionTypes,
  XrayTransaction,
} from "../../utils/parser/types";
import { TokenBalance } from "./token-balance";

function transactionBreakdown(transaction: XrayTransaction, address?: string) {
  const isWallet = getAccountType(null, [], undefined) === AccountType.Wallet;
  switch (transaction.type) {
    case ParserTransactionTypes.TRANSFER:
      let parsedIndex = 0;
      //logic to ignore token account creation
      if (
        transaction?.actions.length > 1 &&
        transaction?.actions[0]?.mint ==
          "So11111111111111111111111111111111111111112"
      ) {
        parsedIndex = 1;
      }
      enum Relationship {
        Sender = "sender",
        Receiver = "receiver",
        None = "none",
      }
      let relationship = Relationship.None;
      if (address === transaction?.actions[parsedIndex]?.from) {
        relationship = Relationship.Sender;
      } else if (address === transaction?.actions[parsedIndex]?.to) {
        relationship = Relationship.Receiver;
      }
      if (transaction.description?.includes("to multiple accounts")) {
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <p style={{ margin: 0, marginRight: "8px" }}>
              Transfer to multiple accounts.
            </p>{" "}
          </div>
        );
      }
      const mintParam = transaction?.actions[parsedIndex]?.mint;
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <p style={{ margin: 0, marginRight: "8px" }}>
            {relationship === Relationship.Sender
              ? "Sent"
              : relationship === Relationship.Receiver
                ? "Received"
                : "Transferred"}
          </p>
          {mintParam && (
            <TokenBalance
              amount={transaction.actions[parsedIndex].amount}
              decimals={transaction.actions[parsedIndex].decimals}
              mint={new PublicKey(mintParam)}
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
    case ParserTransactionTypes.CNFT_MINT:
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <p style={{ margin: 0, marginRight: "8px" }}>Minted</p>
          {transaction?.actions[0]?.mint && (
            <TokenBalance
              amount={transaction.actions[0].amount}
              decimals={0}
              mint={new PublicKey(transaction.actions[0].mint)}
              isReadable={true}
              isNFT={true}
            />
          )}
        </div>
      );
    case ParserTransactionTypes.BURN:
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <p style={{ margin: 0, marginRight: "8px" }}>Burned</p>
          {transaction?.actions[0]?.mint && (
            <TokenBalance
              amount={transaction.actions[0].amount}
              decimals={0}
              mint={new PublicKey(transaction.actions[0].mint)}
              isReadable={true}
              isNFT={false}
            />
          )}
        </div>
      );
    case ParserTransactionTypes.CNFT_TRANSFER:
      enum Relationship_CNFT {
        Sender = "sender",
        Receiver = "receiver",
        None = "none",
      }
      let relationship_CNFT = Relationship_CNFT.None;
      if (address === transaction?.actions[0]?.from) {
        relationship_CNFT = Relationship_CNFT.Sender;
      } else if (address === transaction?.actions[0]?.to) {
        relationship_CNFT = Relationship_CNFT.Receiver;
      }
      if (transaction.description?.includes("to multiple accounts")) {
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <p style={{ margin: 0, marginRight: "8px" }}>
              Transfer to multiple accounts.
            </p>{" "}
          </div>
        );
      }
      const mintParam_cnft = transaction?.actions[0]?.mint;
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <p style={{ margin: 0, marginRight: "8px" }}>
            {relationship_CNFT === Relationship_CNFT.Sender
              ? "Sent"
              : relationship_CNFT === Relationship_CNFT.Receiver
                ? "Received"
                : "Transferred"}
          </p>
          {mintParam_cnft && (
            <TokenBalance
              amount={transaction.actions[0].amount}
              decimals={transaction.actions[0].decimals}
              mint={new PublicKey(mintParam_cnft)}
              isReadable={true}
              isNFT={true}
            />
          )}
        </div>
      );
    case ParserTransactionTypes.TOKEN_MINT:
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <p style={{ margin: 0, marginRight: "8px" }}>Minted</p>
          {transaction?.actions[0]?.mint && (
            <TokenBalance
              amount={transaction.actions[0].amount}
              decimals={0}
              mint={new PublicKey(transaction.actions[0].mint)}
              isReadable={true}
              isNFT={true}
            />
          )}
        </div>
      );
    case ParserTransactionTypes.NFT_SALE:
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* <p style={{ margin: 0, marginRight: "8px" }}>Swapped </p> */}
          {transaction?.actions[1]?.mint && (
            <TokenBalance
              amount={transaction.actions[1].amount}
              decimals={transaction.actions[1].decimals}
              mint={new PublicKey(transaction?.actions[1]?.mint)}
              isReadable={false}
            />
          )}
          <ArrowRightLeftIcon className="mx-3 h-6 w-6" />
          {transaction?.actions[0]?.mint && (
            <TokenBalance
              amount={transaction.actions[0].amount}
              decimals={transaction.actions[0].decimals}
              mint={new PublicKey(transaction?.actions[0]?.mint)}
              isReadable={true}
            />
          )}
        </div>
      );
    case ParserTransactionTypes.NFT_MINT:
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <p style={{ margin: 0, marginRight: "8px" }}>Minted</p>
          {transaction?.actions[0]?.mint && (
            <TokenBalance
              amount={transaction.actions[0].amount}
              decimals={0}
              mint={new PublicKey(transaction.actions[0].mint)}
              isReadable={true}
              isNFT={true}
            />
          )}
        </div>
      );
    case ParserTransactionTypes.UNKNOWN:
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <p style={{ margin: 0, marginRight: "8px" }}>
            Transaction could not be parsed.
          </p>
        </div>
      );
  }
  return "Unknown transaction type";
}

export default transactionBreakdown;
