"use client";

import {
  ParsedInnerInstruction,
  ParsedInstruction,
  PartiallyDecodedInstruction,
  PublicKey,
} from "@solana/web3.js";

import { lamportsToSolString } from "@/lib/utils";

import Address from "@/components/common/address";
import Data from "@/components/common/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export default function Instruction({
  instruction,
  index,
  innerInstructions,
}: {
  instruction: ParsedInstruction | PartiallyDecodedInstruction;
  innerInstructions?: ParsedInnerInstruction[] | null;
  index: number;
}) {
  return (
    <>
      <Card key={`instruction-${index}`} className="mb-6 w-full">
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
                  <Address>{instruction.programId.toString()}</Address>
                </TableCell>
              </TableRow>
              {"parsed" in instruction && (
                <>
                  {instruction.parsed.type === "transfer" ? (
                    <>
                      <TableRow key={`from-address-${index}`}>
                        <TableCell>From Address</TableCell>
                        <TableCell>
                          <Address>{instruction.parsed.info.source}</Address>
                        </TableCell>
                      </TableRow>
                      <TableRow key={`to-address-${index}`}>
                        <TableCell>To Address</TableCell>
                        <TableCell>
                          <Address>
                            {instruction.parsed.info.destination}
                          </Address>
                        </TableCell>
                      </TableRow>
                      {instruction.parsed.info.lamports && (
                        <TableRow key={`transfer-amount-${index}`}>
                          <TableCell>Transfer Amount</TableCell>
                          <TableCell>
                            {`${lamportsToSolString(instruction.parsed.info.lamports, 7)} SOL`}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ) : (
                    <>
                      <TableRow key={`from-address-${index}`}>
                        <TableCell className="align-top">
                          Instruction Data (JSON)
                        </TableCell>
                        <TableCell>
                          <pre>
                            {JSON.stringify(instruction.parsed, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </>
              )}
              {"accounts" in instruction &&
                instruction.accounts.map((account, index) => (
                  <TableRow key={`account-key-${index}`}>
                    <TableCell>Account #{index}</TableCell>
                    <TableCell>
                      <Address>{account.toString()}</Address>
                    </TableCell>
                  </TableRow>
                ))}
              {"data" in instruction && (
                <TableRow key={`data-${index}`}>
                  <TableCell className="align-top">Data (base-58)</TableCell>
                  <TableCell>
                    <Data>{instruction.data}</Data>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {innerInstructions &&
            innerInstructions.some(
              (innerInstruction: { index: number }) =>
                innerInstruction.index === index,
            ) && (
              <>
                <div className="w-fullp-2 my-4 flex">
                  <h2 className="text-lg font-bold tracking-tight">
                    Inner instructions
                  </h2>
                </div>
                {innerInstructions &&
                  innerInstructions.find(
                    (innerInstruction: { index: number }) =>
                      innerInstruction.index === index,
                  )?.instructions &&
                  innerInstructions
                    .find(
                      (innerInstruction: { index: number }) =>
                        innerInstruction.index === index,
                    )
                    ?.instructions.map((instruction, index: number) => (
                      <Instruction
                        key={`innerInstruction-${index}`}
                        index={index}
                        instruction={instruction}
                      />
                    ))}
              </>
            )}
        </CardContent>
      </Card>
    </>
  );
}
