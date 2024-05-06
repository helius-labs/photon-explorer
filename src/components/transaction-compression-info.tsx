"use client";

import Address from "@/components/address";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetTransactionWithCompressionInfo } from "@/lib/web3";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TransactionCompressionInfo({ tx }: { tx: any }) {
  const { transactionWithCompressionInfo, isLoading, isError } =
    useGetTransactionWithCompressionInfo(tx);

  if (!isError && !isLoading && transactionWithCompressionInfo) {
    console.log(transactionWithCompressionInfo);
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Compression accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Account Hash</TableHead>
                <TableHead>Account Owner</TableHead>
                <TableHead>Token Mint</TableHead>
                <TableHead>Token Owner</TableHead>
                <TableHead>Token Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionWithCompressionInfo.compression_info.opened_accounts.map(
                (item: any, index: number) => (
                  <TableRow key={`opened-accounts-${index}`}>
                    <TableCell>Open</TableCell>
                    <TableCell>
                      <Address>{item.account.hash}</Address>
                    </TableCell>
                    <TableCell>
                      <Address>{item.account.owner}</Address>
                    </TableCell>
                    <TableCell>
                      <Address>{item.optional_token_data.mint}</Address>
                    </TableCell>
                    <TableCell>
                      <Address>{item.optional_token_data.owner}</Address>
                    </TableCell>
                    <TableCell>
                      {(item.optional_token_data.amount / 1e9).toFixed(7)} SOL
                    </TableCell>
                  </TableRow>
                ),
              )}
              {transactionWithCompressionInfo.compression_info.closed_accounts.map(
                (item: any, index: number) => (
                  <TableRow key={`closed-accounts-${index}`}>
                    <TableCell>Closed</TableCell>
                    <TableCell>
                      <Address>{item.account.hash}</Address>
                    </TableCell>
                    <TableCell>
                      <Address>{item.account.owner}</Address>
                    </TableCell>
                    <TableCell>
                      <Address>{item.optional_token_data.mint}</Address>
                    </TableCell>
                    <TableCell>
                      <Address>{item.optional_token_data.owner}</Address>
                    </TableCell>
                    <TableCell>
                      {(item.optional_token_data.amount / 1e9).toFixed(7)} SOL
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
}
