import { Result } from "@/schemas/getTransaction";

import { useGetTokenListAll } from "@/hooks/tokenlist";

import Address from "@/components/address";
import TokenSymbol from "@/components/token-symbol";
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
  if (result.meta.postTokenBalances.length === 0) return null;

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
            {result.meta.postTokenBalances.map((item: any, index: number) => (
              <TableRow key={`token-balance-${index}`}>
                <TableCell>
                  <Address short={false}>
                    {
                      result.transaction.message.accountKeys[item.accountIndex]
                        .pubkey
                    }
                  </Address>
                </TableCell>
                <TableCell>
                  <Address short={false}>{item.mint}</Address>
                </TableCell>
                <TableCell>
                  <Badge>{`+ ${item.uiTokenAmount.uiAmountString}`}</Badge>
                </TableCell>
                <TableCell>
                  {item.uiTokenAmount.uiAmountString}{" "}
                  <TokenSymbol>{item.mint}</TokenSymbol>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
