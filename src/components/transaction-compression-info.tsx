"use client";

import { useGetTransactionWithCompressionInfo } from "@/hooks/compression";

import Address from "@/components/address";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Compression Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Amount</TableHead>
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
                      {`${Number((item.account.lamports / 1e9).toFixed(7))} SOL`}
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
                      {`${(item.account.lamports / 1e9).toFixed(7)} SOL`}
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
