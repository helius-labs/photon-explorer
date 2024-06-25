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

export default function TransactionCompressionInfo({ tx }: { tx: string }) {
  const { data, isLoading, isError } = useGetTransactionWithCompressionInfo(tx);

  if (
    !isError &&
    !isLoading &&
    data &&
    (data.compressionInfo.openedAccounts.length > 0 ||
      data.compressionInfo.closedAccounts.length > 0)
  ) {
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
              {data.compressionInfo.openedAccounts.map((item, index) => (
                <TableRow key={`opened-accounts-${index}`}>
                  <TableCell>Opened</TableCell>
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
              ))}
              {data.compressionInfo.closedAccounts.map((item, index) => (
                <TableRow key={`closed-accounts-${index}`}>
                  <TableCell>Closed</TableCell>
                  <TableCell>
                    <Address
                      link={false}
                      pubkey={new PublicKey(item.account.hash)}
                    />
                  </TableCell>
                  <TableCell>
                    <Address pubkey={new PublicKey(item.account.owner)} />
                  </TableCell>
                  <TableCell>
                    {`${lamportsToSolString(item.account.lamports, 7)} SOL`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
}
