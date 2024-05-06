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
                <TableHead>Hash</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionWithCompressionInfo.compression_info.opened_accounts.map(
                (item: any, index: number) => (
                  <TableRow key={`opened-accounts-${index}`}>
                    <TableCell>Open</TableCell>
                    <TableCell>
                      <Address short={false}>{item.account.hash}</Address>
                    </TableCell>
                    <TableCell>
                      <Address short={false}>{item.account.owner}</Address>
                    </TableCell>
                    <TableCell>
                      {(item.account.lamports / 1e9).toFixed(7)} SOL
                    </TableCell>
                  </TableRow>
                ),
              )}
              {transactionWithCompressionInfo.compression_info.closed_accounts.map(
                (item: any, index: number) => (
                  <TableRow key={`opened-accounts-${index}`}>
                    <TableCell>Closed</TableCell>

                    <TableCell>
                      <Address short={false}>{item.account.hash}</Address>
                    </TableCell>
                    <TableCell>
                      <Address short={false}>{item.account.owner}</Address>
                    </TableCell>
                    <TableCell>
                      {(item.account.lamports / 1e9).toFixed(7)} SOL
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
