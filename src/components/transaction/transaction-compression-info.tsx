import { PublicKey } from "@solana/web3.js";

import { lamportsToSolString } from "@/lib/utils";

import { useGetTransactionWithCompressionInfo } from "@/hooks/compression";

import Address from "@/components/common/address";
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
                      <Address pubkey={new PublicKey(item.account.hash)} />
                    </TableCell>
                    <TableCell>
                      <Address pubkey={new PublicKey(item.account.owner)} />
                    </TableCell>
                    <TableCell>
                      {`${lamportsToSolString(item.account.lamports, 7)} SOL`}
                    </TableCell>
                  </TableRow>
                ),
              )}
              {transactionWithCompressionInfo.compression_info.closed_accounts.map(
                (item: any, index: number) => (
                  <TableRow key={`closed-accounts-${index}`}>
                    <TableCell>Closed</TableCell>
                    <TableCell>
                      <Address pubkey={new PublicKey(item.account.hash)} />
                    </TableCell>
                    <TableCell>
                      <Address pubkey={new PublicKey(item.account.owner)} />
                    </TableCell>
                    <TableCell>
                      {`${lamportsToSolString(item.account.lamports, 7)} SOL`}
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
