import {
  dateFormat,
  lamportsToSolString,
  normalizeTokenAmount,
  timeAgoWithFormat,
} from "@/utils/common";
import { SOL } from "@/utils/parser";
import { CompressedTransaction } from "@lightprotocol/stateless.js";
import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { ArrowRightLeft } from "lucide-react";

import Address from "@/components/common/address";
import { BalanceDelta } from "@/components/common/balance-delta";
import Signature from "@/components/common/signature";
import { TokenBalanceDelta } from "@/components/common/token-balance-delta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { generateTokenBalanceRows } from "./transaction-token-balances";

export default function TransactionOverviewCompressed({
  signature,
  data,
  compressed,
}: {
  signature: string;
  data: ParsedTransactionWithMeta;
  compressed: CompressedTransaction | null;
}) {
  interface Row {
    pubkey: PublicKey;
    delta: BigNumber;
    mint: PublicKey;
    sortOrder: number;
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
        delta: new BigNumber(lamportsToSolString(delta.toNumber(), 9)),
        mint: new PublicKey(SOL),
        sortOrder: 2,
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
      // SOL tokens are already covered by the native balance changes
      if (row.mint === SOL) {
        return [];
      }

      // Ignore zero balance changes
      if (row.delta.eq(0)) {
        return [];
      }

      return {
        pubkey: row.account,
        delta: row.delta,
        mint: new PublicKey(row.mint),
        sortOrder: 1,
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
        const delta = new BigNumber(
          lamportsToSolString(item.account.lamports, 9),
        );

        return {
          pubkey,
          delta,
          mint: new PublicKey(SOL),
          sortOrder: 2,
        };
      });

    closedAccounts = compressed.compressionInfo.closedAccounts
      .filter((closedAccount) => closedAccount.account.lamports > 0)
      .map((item, index) => {
        const pubkey = new PublicKey(item.account.hash);
        const delta = new BigNumber(
          lamportsToSolString(item.account.lamports * -1, 9),
        );

        return {
          pubkey,
          delta,
          mint: new PublicKey(SOL),
          sortOrder: 2,
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
            delta: new BigNumber(
              normalizeTokenAmount(item.maybeTokenData.amount.toNumber(), 9),
            ),
            mint: item.maybeTokenData.mint,
            sortOrder: 1,
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
            delta: new BigNumber(
              normalizeTokenAmount(item.maybeTokenData.amount.toNumber(), 9) *
                -1,
            ),
            mint: item.maybeTokenData.mint,
            sortOrder: 1,
          };
        }
        return [];
      });
  }

  const rows = [...accountRows, ...tokenRows]
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        Math.abs(b.delta.toNumber()) - Math.abs(a.delta.toNumber()) ||
        a.delta.toNumber() - b.delta.toNumber(),
    )
    .map((item, index) => {
      return (
        <TableRow key={`account-rows-${index}`} className="font-mono">
          <TableCell>
            <Address pubkey={item.pubkey} />
          </TableCell>
          <TableCell>
            <TokenBalanceDelta mint={item.mint} delta={item.delta} />
          </TableCell>
        </TableRow>
      );
    });

  const compressedRows = [
    ...openedAccounts,
    ...closedAccounts,
    ...openedTokenAccounts,
    ...closedTokenAccounts,
  ]
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        Math.abs(b.delta.toNumber()) - Math.abs(a.delta.toNumber()) ||
        a.delta.toNumber() - b.delta.toNumber(),
    )
    .map((item, index) => {
      return (
        <TableRow key={`account-rows-${index}`} className="font-mono">
          <TableCell>
            <Address pubkey={item.pubkey} />
          </TableCell>
          <TableCell>
            <TokenBalanceDelta mint={item.mint} delta={item.delta} />
          </TableCell>
        </TableRow>
      );
    });

  return (
    <Card className="mx-auto w-full max-w-lg p-3">
      <CardHeader className="flex flex-col items-start justify-between space-y-3 md:flex-row md:items-center md:space-y-0">
        <div className="flex items-center space-x-3">
          <ArrowRightLeft className="h-6 w-6" />
          <CardTitle className="text-xl font-bold md:text-2xl">
            Transaction
          </CardTitle>
          <Badge
            className="px-2 py-1 text-xs"
            variant={data.meta?.err === null ? "success" : "destructive"}
          >
            {data.meta?.err === null ? "Success" : "Failed"}
          </Badge>
        </div>
        <div className="flex flex-col items-start text-left md:items-end md:text-right">
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
          <TableBody>
            {rows}

            {data?.meta?.fee && (
              <TableRow
                key={`account-rows-transaction-fee`}
                className="font-mono"
              >
                <TableCell>
                  <span>Transaction Fee</span>
                  <br />
                  <Address
                    pubkey={data.transaction.message.accountKeys[0].pubkey}
                  />
                </TableCell>
                <TableCell className="text-red-400">
                  <TokenBalanceDelta
                    mint={new PublicKey(SOL)}
                    delta={
                      new BigNumber(
                        lamportsToSolString(data?.meta?.fee * -1, 9),
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {compressedRows.length > 0 && (
          <>
            <div className="space-y-4">
              <h2 className="text text-md font-medium">Compressed</h2>
              <Table className="mb-8">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Address</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{compressedRows}</TableBody>
              </Table>
            </div>
          </>
        )}

        <Separator />

        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
          <span className="font-medium">Signature</span>
          <div className="flex items-center space-x-2">
            <Signature link={false} signature={signature} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
