"use client";

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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Data from "@/components/data";

export default function TransactionInstructions({
  transaction,
}: {
  transaction: any;
}) {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Instructions</h2>
      </div>

      {transaction.transaction.message.instructions.map(
        (instruction: any, index: number) => (
          <Card key={`instruction-${index}`} className="w-full">
            <CardHeader>
              <CardTitle>
                <Badge className="mr-2">#{index}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow key={`program-${index}`}>
                    <TableCell className="w-1/6">Program</TableCell>
                    <TableCell className="w-5/6">
                      <Address short={false}>{instruction.programId}</Address>
                    </TableCell>
                  </TableRow>
                  {instruction.accounts.map((account: any, index: number) => (
                    <TableRow key={`account-key-${index}`}>
                      <TableCell>Account #{index}</TableCell>
                      <TableCell>
                        <Address short={false}>{account}</Address>
                      </TableCell>
                    </TableRow>
                  ))}
                  {instruction.data && (
                    <TableRow key={`data-${index}`}>
                      <TableCell>Data (base-58)</TableCell>
                      <TableCell>
                        <Data>{instruction.data}</Data>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {transaction.meta.innerInstructions.some(
                (innerInstruction: { index: number }) =>
                  innerInstruction.index === index,
              ) && (
                <>
                  <div className="w-fullp-2 my-4 flex">
                    <h2 className="text-lg font-bold tracking-tight">
                      Inner instructions
                    </h2>
                  </div>
                  {transaction.meta.innerInstructions
                    .find(
                      (innerInstruction: { index: number }) =>
                        innerInstruction.index === index,
                    )
                    .instructions.map((instruction: any, index: number) => (
                      <Card
                        key={`instruction-${index}`}
                        className="mb-4 w-full"
                      >
                        <CardHeader>
                          <CardTitle>
                            <Badge className="mr-2">#{index}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableBody>
                              <TableRow key={`program-${index}`}>
                                <TableCell className="w-1/6">Program</TableCell>
                                <TableCell className="w-5/6">
                                  <Address short={false}>
                                    {instruction.programId}
                                  </Address>
                                </TableCell>
                              </TableRow>
                              {instruction.parsed &&
                                instruction.parsed.type === "transfer" && (
                                  <>
                                    <TableRow key={`from-address-${index}`}>
                                      <TableCell>From Address</TableCell>
                                      <TableCell>
                                        <Address short={false}>
                                          {instruction.parsed.info.source}
                                        </Address>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow key={`to-address-${index}`}>
                                      <TableCell>To Address</TableCell>
                                      <TableCell>
                                        <Address short={false}>
                                          {instruction.parsed.info.destination}
                                        </Address>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow key={`to-address-${index}`}>
                                      <TableCell>Transfer Amount</TableCell>
                                      <TableCell>
                                        {`${instruction.parsed.info.lamports / 1e9} SOL`}
                                      </TableCell>
                                    </TableRow>
                                  </>
                                )}
                              {instruction.accounts &&
                                instruction.accounts.map(
                                  (account: any, index: number) => (
                                    <TableRow key={`account-key-${index}`}>
                                      <TableCell>Account #{index}</TableCell>
                                      <TableCell>
                                        <Address short={false}>
                                          {account}
                                        </Address>
                                      </TableCell>
                                    </TableRow>
                                  ),
                                )}
                              {instruction.data && (
                                <TableRow key={`data-${index}`}>
                                  <TableCell>Data (base-58)</TableCell>
                                  <TableCell>
                                    <Data>{instruction.data}</Data>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                </>
              )}
            </CardContent>
          </Card>
        ),
      )}
    </>
  );
}
