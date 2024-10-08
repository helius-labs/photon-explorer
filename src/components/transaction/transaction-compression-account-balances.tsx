import { lamportsToSolString } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";

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
import { Badge } from "@/components/ui/badge";

export default function TransactionCompressionAccountBalances({
  tx,
}: {
  tx: string;
}) {
  const { data, isLoading, isError } = useGetTransactionWithCompressionInfo(tx);

  if (
    !isError &&
    !isLoading &&
    data
  ) {
    return (
      <div className="mx-[-1rem] md:mx-0 overflow-x-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Compression Account Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hash</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Status</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody className="font-mono">
                {data.compressionInfo.openedAccounts.map((item, index) => (
                  <TableRow key={`opened-accounts-${index}`}>
                    <TableCell>
                      <Address pubkey={new PublicKey(item.account.hash)} />
                    </TableCell>
                    <TableCell>
                      {item.account.address ? (
                        <Address pubkey={new PublicKey(item.account.address)} />
                      ) : (
                        <>-</>
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        item.account.lamports > 0 ? "text-green-500" : ""
                      }
                    >
                      {item.account.lamports > 0 && `+`}
                      {`${lamportsToSolString(item.account.lamports, 7)} SOL`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Opened</Badge>
                    </TableCell>

                  </TableRow>
                ))}
                {data.compressionInfo.closedAccounts.map((item, index) => (
                  <TableRow key={`closed-accounts-${index}`}>
                    <TableCell>
                      <Address
                        link={false}
                        pubkey={new PublicKey(item.account.hash)}
                      />
                    </TableCell>
                    <TableCell>
                      {item.account.address ? (
                        <Address pubkey={new PublicKey(item.account.address)} />
                      ) : (
                        <>-</>
                      )}
                    </TableCell>
                    <TableCell
                      className={item.account.lamports > 0 ? "text-red-500" : ""}
                    >
                      {item.account.lamports > 0 && `-`}
                      {`${lamportsToSolString(item.account.lamports, 7)} SOL`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Closed</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
}
