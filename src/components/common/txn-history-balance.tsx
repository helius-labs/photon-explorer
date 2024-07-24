import { AccountType, getAccountType } from "@/utils/account";
import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { ArrowRightLeftIcon } from "lucide-react";
import React from "react";

import { useGetTransaction } from "@/hooks/web3";

import {
  ParserTransactionTypes,
  XrayTransaction,
} from "../../utils/parser/types";
import { TokenBalance } from "./token-balance";

interface BalanceChange {
  mint: string;
  change: number;
  decimals: number;
}
function isParsedTransactionWithMeta(
  data: any,
): data is ParsedTransactionWithMeta {
  return (
    data &&
    typeof data === "object" &&
    "meta" in data &&
    "transaction" in data &&
    "message" in data.transaction &&
    "accountKeys" in data.transaction.message
  );
}

function calculateBalanceChanges(
  response: ParsedTransactionWithMeta,
  account: string,
): BalanceChange[] {
  const meta = response.meta;
  const accountKeys = response.transaction.message.accountKeys;
  const accountPubkey = new PublicKey(account);
  const accountIndex = accountKeys.findIndex((key) =>
    key.pubkey.equals(accountPubkey),
  );

  if (accountIndex === -1) {
    return []; // Account not found in transaction
  }

  const nativeBalanceChanges: BalanceChange[] = [];
  const tokenBalanceChanges: BalanceChange[] = [];

  // Calculate native balance changes
  const preBalance = meta?.preBalances[accountIndex];
  const postBalance = meta?.postBalances[accountIndex];
  const balanceChange =
    postBalance !== undefined && preBalance !== undefined
      ? postBalance - preBalance
      : 0;

  if (balanceChange !== 0) {
    nativeBalanceChanges.push({
      mint: "So11111111111111111111111111111111111111112",
      change: balanceChange,
      decimals: 9, // SOL has 9 decimals
    });
  }

  // Calculate token balance changes
  const preTokenBalances =
    meta?.preTokenBalances?.filter(
      (tokenBalance) => tokenBalance.owner === account,
    ) || [];
  const postTokenBalances =
    meta?.postTokenBalances?.filter(
      (tokenBalance) => tokenBalance.owner === account,
    ) || [];

  // Combine pre and post token balances
  const allMints = new Set([
    ...preTokenBalances.map((balance) => balance.mint),
    ...postTokenBalances.map((balance) => balance.mint),
  ]);

  allMints.forEach((mint) => {
    const preTokenBalance = preTokenBalances.find(
      (balance) => balance.mint === mint,
    );
    const postTokenBalance = postTokenBalances.find(
      (balance) => balance.mint === mint,
    );

    const preAmount = preTokenBalance
      ? BigInt(preTokenBalance.uiTokenAmount.amount)
      : BigInt(0);
    const postAmount = postTokenBalance
      ? BigInt(postTokenBalance.uiTokenAmount.amount)
      : BigInt(0);

    const tokenChange = postAmount - preAmount;

    if (tokenChange !== BigInt(0)) {
      tokenBalanceChanges.push({
        mint: mint,
        change: Number(tokenChange),
        decimals:
          preTokenBalance?.uiTokenAmount.decimals ||
          postTokenBalance?.uiTokenAmount.decimals ||
          0,
      });
    }
  });

  return [...nativeBalanceChanges, ...tokenBalanceChanges];
}

function TransactionBalances(transaction: XrayTransaction, address: string) {
  const txnData = useGetTransaction(transaction.signature);

  if (isParsedTransactionWithMeta(txnData.data)) {
    const balanceChanges = calculateBalanceChanges(txnData.data, address);

    return (
      <>
        {balanceChanges.map((change, index) => (
          <div key={index} className="flex items-start py-1 text-start">
            <TokenBalance
              amount={change.change}
              mint={new PublicKey(change.mint)}
              isReadable={false}
              decimals={change.decimals}
              showChanges={true}
            />
          </div>
        ))}
      </>
    );
  } else {
    console.error("Invalid transaction data");
  }
}

export default TransactionBalances;
