import {
  ParsedTransactionWithMeta,
  PublicKey,
  TokenBalance as TokenBalanceType,
} from "@solana/web3.js";

import { lamportsToSolString } from "@/lib/utils";

import Address from "@/components/common/address";
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

export default function TransactionTokenBalances({
  data,
}: {
  data: ParsedTransactionWithMeta;
}) {
  type TokenBalance = {
    address: PublicKey;
    mint: PublicKey;
    change: number;
    postBalance: string;
  };

  if (
    data.meta &&
    data.meta?.preTokenBalances &&
    data.meta?.preTokenBalances.length === 0
  )
    return null;

  // Calculate token balances
  const tokenBalances: TokenBalance[] | undefined =
    data.meta?.preTokenBalances?.map(
      (item: TokenBalanceType): TokenBalance => ({
        address: data.transaction.message.accountKeys[item.accountIndex].pubkey,
        mint: new PublicKey(item.mint),
        change:
          item.uiTokenAmount.uiAmount ||
          0 -
            (data.meta?.postTokenBalances?.find(
              (postBalance) => postBalance.accountIndex === item.accountIndex,
            )?.uiTokenAmount.uiAmount || 0),
        postBalance:
          data.meta?.postTokenBalances?.find(
            (postBalance) => postBalance.accountIndex === item.accountIndex,
          )?.uiTokenAmount.uiAmountString || "0",
      }),
    );

  return (
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
              <TableHead>Post Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokenBalances?.map((item: TokenBalance, index) => (
              <TableRow key={`token-balance-${index}`}>
                <TableCell>
                  <Address pubkey={item.address} short={true} />
                </TableCell>
                <TableCell>
                  <Address pubkey={item.mint} short={true} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {item.change > 0 ? "+" : ""}
                    {item.change !== 0
                      ? lamportsToSolString(item.change, 9)
                      : item.change}
                  </Badge>
                </TableCell>
                <TableCell>{item.postBalance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
