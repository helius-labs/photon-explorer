import { lamportsToSolString, timeAgoWithFormat } from "@/utils/common";
import { ParsedTransactionWithMeta } from "@solana/web3.js";

import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export default function TransactionInfo({
  data,
}: {
  data: ParsedTransactionWithMeta;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transaction Metadata</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="w-1/4">Slot</TableCell>
              <TableCell>{data?.slot}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Signer</TableCell>
              <TableCell>
                <Address
                  pubkey={data?.transaction.message.accountKeys[0].pubkey}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fee Payer</TableCell>
              <TableCell>
                <Address
                  pubkey={data?.transaction.message.accountKeys[0].pubkey}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Transaction Fee</TableCell>
              <TableCell>
                {data?.meta?.fee && (
                  <span>{lamportsToSolString(data?.meta?.fee, 7)} SOL</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Compute units consumed</TableCell>
              <TableCell>{data?.meta?.computeUnitsConsumed}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Transaction Version</TableCell>
              <TableCell>{data?.version}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Recent Blockhash</TableCell>
              <TableCell>{data?.transaction.message.recentBlockhash}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
