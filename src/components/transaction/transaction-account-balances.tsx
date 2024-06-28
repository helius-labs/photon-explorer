import { ParsedTransactionWithMeta } from "@solana/web3.js";
import BigNumber from "bignumber.js";

import Address from "@/components/common/address";
import { BalanceDelta } from "@/components/common/balance-delta";
import { ErrorCard } from "@/components/common/error-card";
import { SolBalance } from "@/components/common/sol-balance";
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

export default function TransactionAccountBalances({
  data,
}: {
  data: ParsedTransactionWithMeta;
}) {
  if (!data.meta) {
    return <ErrorCard text="Transaction metadata is missing" />;
  }

  const accountRows = data.transaction.message.accountKeys.map(
    (account, index) => {
      const pre = data.meta!.preBalances[index];
      const post = data.meta!.postBalances[index];
      const pubkey = account.pubkey;
      const key = account.pubkey.toBase58();
      const delta = new BigNumber(post).minus(new BigNumber(pre));

      return (
        <TableRow key={key}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>
            <Address pubkey={pubkey} />
          </TableCell>
          <TableCell>
            <BalanceDelta delta={delta} isSol />
          </TableCell>
          <TableCell>
            <SolBalance lamports={post} />
          </TableCell>
          <TableCell className="space-x-2">
            {index === 0 && <Badge variant="outline">Fee Payer</Badge>}
            {account.signer && <Badge variant="outline">Signer</Badge>}
            {account.writable && <Badge variant="outline">Writable</Badge>}
            {data.transaction.message.instructions.find((ix) =>
              ix.programId.equals(pubkey),
            ) && <Badge variant="outline">Program</Badge>}
            {account.source === "lookupTable" && (
              <Badge variant="outline">Address Table Lookup</Badge>
            )}
          </TableCell>
        </TableRow>
      );
    },
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Account Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  <span>#</span>
                </div>
              </TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Post Balance</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono">{accountRows}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
