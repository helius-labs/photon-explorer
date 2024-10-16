import {
  ParsedMessageAccount,
  ParsedTransactionWithMeta,
  PublicKey,
  TokenAmount,
  TokenBalance as TokenBalanceType,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";

import Address from "@/components/common/address";
import { TokenBalanceDelta } from "@/components/common/token-balance-delta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TokenBalanceRow = {
  account: PublicKey;
  mint: string;
  balance: TokenAmount;
  delta: BigNumber;
  accountIndex: number;
};

export default function TransactionTokenBalances({
  data,
}: {
  data: ParsedTransactionWithMeta;
}) {
  const preTokenBalances = data.meta?.preTokenBalances;
  const postTokenBalances = data.meta?.postTokenBalances;
  const accountKeys = data.transaction.message.accountKeys;

  if (!preTokenBalances || !postTokenBalances || !accountKeys) {
    return null;
  }

  const rows = generateTokenBalanceRows(
    preTokenBalances,
    postTokenBalances,
    accountKeys,
  );

  if (rows.length < 1) {
    return null;
  }

  return (
    <div className="mx-[-1rem] md:mx-0 overflow-x-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ account, delta, mint }, index) => (
                <TableRow key={`token-balance-${index}`} className="font-mono">
                  <TableCell>
                    <Address pubkey={account} />
                  </TableCell>
                  <TableCell>
                    <Address pubkey={new PublicKey(mint)} />
                  </TableCell>
                  <TableCell>
                    <TokenBalanceDelta mint={new PublicKey(mint)} delta={delta} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function generateTokenBalanceRows(
  preTokenBalances: TokenBalanceType[],
  postTokenBalances: TokenBalanceType[],
  accounts: ParsedMessageAccount[],
): TokenBalanceRow[] {
  const preBalanceMap: { [index: number]: TokenBalanceType } = {};
  const postBalanceMap: { [index: number]: TokenBalanceType } = {};

  preTokenBalances.forEach(
    (balance) => (preBalanceMap[balance.accountIndex] = balance),
  );
  postTokenBalances.forEach(
    (balance) => (postBalanceMap[balance.accountIndex] = balance),
  );

  // Check if any pre token balances do not have corresponding
  // post token balances. If not, insert a post balance of zero
  // so that the delta is displayed properly
  for (const index in preBalanceMap) {
    const preBalance = preBalanceMap[index];
    if (!postBalanceMap[index]) {
      postBalanceMap[index] = {
        accountIndex: Number(index),
        mint: preBalance.mint,
        uiTokenAmount: {
          amount: "0",
          decimals: preBalance.uiTokenAmount.decimals,
          uiAmount: null,
          uiAmountString: "0",
        },
      };
    }
  }

  const rows: TokenBalanceRow[] = [];

  for (const index in postBalanceMap) {
    const { uiTokenAmount, accountIndex, mint } = postBalanceMap[index];
    const preBalance = preBalanceMap[accountIndex];
    const account = accounts[accountIndex].pubkey;

    if (!uiTokenAmount.uiAmountString) {
      // uiAmount deprecation
      continue;
    }

    // case where mint changes
    if (preBalance && preBalance.mint !== mint) {
      if (!preBalance.uiTokenAmount.uiAmountString) {
        // uiAmount deprecation
        continue;
      }

      rows.push({
        account: accounts[accountIndex].pubkey,
        accountIndex,
        balance: {
          amount: "0",
          decimals: preBalance.uiTokenAmount.decimals,
          uiAmount: 0,
        },
        delta: new BigNumber(-preBalance.uiTokenAmount.uiAmountString),
        mint: preBalance.mint,
      });

      rows.push({
        account: accounts[accountIndex].pubkey,
        accountIndex,
        balance: uiTokenAmount,
        delta: new BigNumber(uiTokenAmount.uiAmountString),
        mint: mint,
      });
      continue;
    }

    let delta;

    if (preBalance) {
      if (!preBalance.uiTokenAmount.uiAmountString) {
        // uiAmount deprecation
        continue;
      }

      delta = new BigNumber(uiTokenAmount.uiAmountString).minus(
        preBalance.uiTokenAmount.uiAmountString,
      );
    } else {
      delta = new BigNumber(uiTokenAmount.uiAmountString);
    }

    rows.push({
      account,
      accountIndex,
      balance: uiTokenAmount,
      delta,
      mint,
    });
  }

  return rows.sort((a, b) => a.accountIndex - b.accountIndex);
}
