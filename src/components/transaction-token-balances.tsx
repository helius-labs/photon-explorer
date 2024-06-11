import { Result } from "@/schemas/getTransaction";

import Address from "@/components/address";
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
  result,
}: {
  result: Result;
}) {
  type TokenBalanace = {
    address: string;
    mint: string;
    change: number;
    postBalance: string;
  };

  if (result.meta.preTokenBalances.length === 0) return null;

  // Calculate token balances
  const tokenBalances: TokenBalanace[] | undefined =
    result.meta.preTokenBalances.map(
      (item: any): TokenBalanace => ({
        address:
          result.transaction.message.accountKeys[item.accountIndex].pubkey,
        mint: item.mint,
        change:
          item.uiTokenAmount.uiAmount -
          (result.meta.postTokenBalances.find(
            (postBalance: any) =>
              postBalance.accountIndex === item.accountIndex,
          )?.uiTokenAmount.uiAmount || 0),
        postBalance:
          result.meta.postTokenBalances.find(
            (postBalance: any) =>
              postBalance.accountIndex === item.accountIndex,
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
            {tokenBalances?.map((item: any, index: number) => (
              <TableRow key={`token-balance-${index}`}>
                <TableCell>
                  <Address short={true}>{item.address}</Address>
                </TableCell>
                <TableCell>
                  <Address short={true}>{item.mint}</Address>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {item.change > 0 ? "+" : ""}
                    {item.change !== 0
                      ? item.change.toLocaleString(undefined, {
                          minimumFractionDigits: 9,
                        })
                      : item.change}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.postBalance} {item.mint}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
