import { dateFormat, timeAgoWithFormat } from "@/utils/common";
import { CompressedTransaction } from "@lightprotocol/stateless.js";
import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { ArrowRightLeft } from "lucide-react";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";

import Address from "@/components/common/address";
import { BalanceDelta } from "@/components/common/balance-delta";
import Signature from "@/components/common/signature";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TokenBalance } from "../common/token-balance";
import { Separator } from "../ui/separator";
import { generateTokenBalanceRows } from "./transaction-token-balances";

export default function TransactionOverviewCompressed({
  signature,
  data,
  compressed,
}: {
  signature: string;
  data: ParsedTransactionWithMeta;
  compressed?: CompressedTransaction;
}) {
  const tokenList = useGetTokenListStrict();

  const signer = data.transaction.message.accountKeys.find(
    (account) => account.signer,
  );

  interface Row {
    pubkey: PublicKey;
    delta: BigNumber;
    mint?: PublicKey;
    decimals?: number;
  }

  // Native balance changes
  let accountRows: Row[] = [];

  accountRows = data.transaction.message.accountKeys.flatMap(
    (account, index) => {
      const pre = data.meta!.preBalances[index];
      const post = data.meta!.postBalances[index];
      const pubkey = account.pubkey;
      let delta = new BigNumber(post).minus(new BigNumber(pre));

      if (index === 0) {
        delta = delta.plus(data.meta!.fee);
      }

      if (delta.isZero()) {
        return [];
      }

      return {
        pubkey,
        delta,
      };
    },
  );

  // Token balance changes
  let tokenRows: Row[] = [];

  const preTokenBalances = data.meta?.preTokenBalances;
  const postTokenBalances = data.meta?.postTokenBalances;
  const accountKeys = data.transaction.message.accountKeys;

  if (preTokenBalances && postTokenBalances && accountKeys) {
    const tempRows = generateTokenBalanceRows(
      preTokenBalances,
      postTokenBalances,
      accountKeys,
    );

    tokenRows = tempRows.flatMap((row) => {
      if (row.delta.eq(0)) {
        return [];
      }

      return {
        pubkey: row.account,
        delta: new BigNumber(row.balance.amount),
        mint: new PublicKey(row.mint),
        decimals: row.balance.decimals,
      };
    });
  }

  // Compressed account and token changes
  let openedAccounts: Row[] = [];
  let closedAccounts: Row[] = [];
  let openedTokenAccounts: Row[] = [];
  let closedTokenAccounts: Row[] = [];

  if (compressed) {
    openedAccounts = compressed.compressionInfo.openedAccounts
      .filter((openedAccount) => openedAccount.account.lamports > 0)
      .map((item, index) => {
        const pubkey = new PublicKey(item.account.hash);
        const delta = new BigNumber(item.account.lamports);

        return {
          pubkey,
          delta,
        };
      });

    closedAccounts = compressed.compressionInfo.closedAccounts
      .filter((closedAccount) => closedAccount.account.lamports > 0)
      .map((item, index) => {
        const pubkey = new PublicKey(item.account.hash);
        const delta = new BigNumber(item.account.lamports * -1);

        return {
          pubkey,
          delta,
        };
      });

    openedTokenAccounts = compressed.compressionInfo.openedAccounts
      .filter(
        (openedAccount) => openedAccount.account.lamports.toNumber() === 0,
      )
      .flatMap((item, index) => {
        if (item.maybeTokenData) {
          return {
            pubkey: item.maybeTokenData.owner,
            delta: item.maybeTokenData.amount,
            mint: item.maybeTokenData.mint,
          };
        }
        return [];
      });

    closedTokenAccounts = compressed.compressionInfo.closedAccounts
      .filter(
        (closedAccounts) => closedAccounts.account.lamports.toNumber() === 0,
      )
      .flatMap((item, index) => {
        if (item.maybeTokenData) {
          return {
            pubkey: item.maybeTokenData.owner,
            delta: new BigNumber(item.maybeTokenData.amount.toNumber() * -1),
            mint: item.maybeTokenData.mint,
          };
        }
        return [];
      });
  }

  const rows = [
    ...accountRows,
    ...tokenRows,
    ...openedAccounts,
    ...closedAccounts,
    ...openedTokenAccounts,
    ...closedTokenAccounts,
  ]
    .sort((a, b) => b.delta.toNumber() - a.delta.toNumber())
    .map((item, index) => {
      if (item.mint) {
        return (
          <TableRow key={`account-rows-${index}`} className="font-mono">
            <TableCell>
              <Address pubkey={item.pubkey} />
            </TableCell>
            <TableCell
              className={item.delta.gt(0) ? "text-green-400" : "text-red-400"}
            >
              {item.delta.gt(0) && `+`}
              <TokenBalance
                mint={item.mint}
                amount={item.delta.toNumber()}
                decimals={item.decimals}
                tokenList={tokenList}
              />
            </TableCell>
          </TableRow>
        );
      }

      return (
        <TableRow key={`account-rows-${index}`} className="font-mono">
          <TableCell>
            <Address pubkey={item.pubkey} />
          </TableCell>
          <TableCell
            className={item.delta.gt(0) ? "text-green-400" : "text-red-400"}
          >
            <BalanceDelta delta={item.delta} isSol />
          </TableCell>
        </TableRow>
      );
    });

  return (
    <Card className="w-full max-w-lg mx-auto p-3">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-3 md:space-y-0">
        <div className="flex items-center space-x-3">
          <ArrowRightLeft className="h-6 w-6" />
          <CardTitle className="text-xl md:text-2xl font-bold">
            Transaction
          </CardTitle>
          <Badge
            className="text-xs py-1 px-2"
            variant={data.meta?.err === null ? "success" : "destructive"}
          >
            {data.meta?.err === null ? "Success" : "Failed"}
          </Badge>
        </div>
        <div className="flex flex-col items-start md:items-end text-left md:text-right">
          <span>{timeAgoWithFormat(data.blockTime!, true)}</span>
          <span className="text-xs text-muted-foreground">
            {dateFormat(data.blockTime!)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <Table className="mb-8">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Address</TableHead>
              <TableHead>Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{rows}</TableBody>
        </Table>

        <Separator />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <span className="font-medium">Signature</span>
          <div className="flex items-center space-x-2">
            <Signature link={false} signature={signature} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
