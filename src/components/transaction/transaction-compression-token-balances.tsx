import { normalizeTokenAmount } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

import { useGetTransactionWithCompressionInfo } from "@/hooks/compression";

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

export default function TransactionCompressionTokenBalances({
  tx,
}: {
  tx: string;
}) {
  const { data, isLoading, isError } = useGetTransactionWithCompressionInfo(tx);

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
            delta: new BigNumber(
              normalizeTokenAmount(item.maybeTokenData.amount.toNumber(), 9),
            ),
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
            delta: new BigNumber(
              normalizeTokenAmount(item.maybeTokenData.amount.toNumber(), 9) *
                -1,
            ),
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
          <TableCell>
            <TokenBalanceDelta mint={item.mint} delta={item.delta} />
          </TableCell>
        </TableRow>
      );
    });

  if (!isError && !isLoading && rows.length > 0) {
    return (
      <div className="mx-[-1rem] overflow-x-auto md:mx-0">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Compression Token Balances</CardTitle>
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
              <TableBody>{rows}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
}
