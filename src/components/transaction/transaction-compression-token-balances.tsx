import { lamportsToSolString } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

import { useGetTransactionWithCompressionInfo } from "@/hooks/compression";
import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";

import Address from "@/components/common/address";
import { TokenBalance } from "@/components/common/token-balance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TransactionCompressionTokenBalances({
  tx,
}: {
  tx: string;
}) {
  const { data, isLoading, isError } = useGetTransactionWithCompressionInfo(tx);

  const tokenList = useGetTokenListStrict();

  interface Row {
    owner: PublicKey;
    delta: BigNumber;
    mint: PublicKey;
  }

  let openedTokenAccounts: Row[] = [];
  let closedTokenAccounts: Row[] = [];

  if (data) {
    openedTokenAccounts = data.compressionInfo.openedAccounts.flatMap(
      (item, index) => {
        if (item.maybeTokenData) {
          return {
            owner: item.maybeTokenData.owner,
            delta: item.maybeTokenData.amount,
            mint: item.maybeTokenData.mint,
          };
        }
        return [];
      },
    );

    closedTokenAccounts = data.compressionInfo.closedAccounts.flatMap(
      (item, index) => {
        if (item.maybeTokenData) {
          return {
            owner: item.maybeTokenData.owner,
            delta: new BigNumber(item.maybeTokenData.amount.toNumber() * -1),
            mint: item.maybeTokenData.mint,
          };
        }
        return [];
      },
    );
  }

  const rows = [...openedTokenAccounts, ...closedTokenAccounts]
    .sort((a, b) => b.delta.toNumber() - a.delta.toNumber())
    .map((item, index) => {
      return (
        <TableRow key={`account-rows-${index}`} className="font-mono">
          <TableCell>
            <Address pubkey={item.owner} />
          </TableCell>
          <TableCell>
            <Address pubkey={item.mint} />
          </TableCell>
          <TableCell
            className={item.delta.gt(0) ? "text-green-400" : "text-red-400"}
          >
            {item.delta.gt(0) && `+`}
            <TokenBalance
              mint={item.mint}
              amount={item.delta.toNumber()}
              tokenList={tokenList}
            />
          </TableCell>
        </TableRow>
      );
    });

  if (!isError && !isLoading && rows.length > 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Compression Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Mint</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{rows}</TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
}
