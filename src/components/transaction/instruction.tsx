"use client";

import { lamportsToSolString } from "@/utils/common";
import { isJitoTip } from "@/utils/jito";
import {
  ParsedInnerInstruction,
  ParsedInstruction,
  PartiallyDecodedInstruction,
  PublicKey,
} from "@solana/web3.js";

import Address from "@/components/common/address";
import Data from "@/components/common/data";
import ParseInstruction from "@/components/common/parse-instruction";
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
  let isJito = false;
  let toAddress: string | undefined;
  let amount: number | undefined;

  if ("parsed" in instruction && instruction.parsed.type === "transfer") {
    toAddress = instruction.parsed.info.destination;
    amount = instruction.parsed.info.lamports;
    
    if (toAddress !== undefined && amount !== undefined) {
      isJito = isJitoTip(toAddress, amount);
    }
  }

  return (
    <>
      <div className="mx-[-1rem] md:mx-0 overflow-x-auto">
      <Card key={`instruction-${index}`} className="mb-6 w-full">
        <CardHeader>
          <CardTitle>
            <Badge className="mr-2 px-2 py-1 text-sm h-6">#{index}</Badge>{" "}
            <Address pubkey={instruction.programId} />
            {isJito && (
              <Badge variant="secondary" className="ml-4 px-2 py-1 text-sm h-6">
                Jito Tip
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {"parsed" in instruction && (
                <>
                  {instruction.parsed.type === "transfer" ? (
                    <>
                      <TableRow key={`from-address-${index}`}>
                        <TableCell>From Address</TableCell>
                        <TableCell>
                          <Address
                            pubkey={
                              new PublicKey(instruction.parsed.info.source)
                            }
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow key={`to-address-${index}`}>
                        <TableCell>To Address</TableCell>
                        <TableCell>
                          <Address
                            pubkey={
                              new PublicKey(instruction.parsed.info.destination)
                            }
                          />
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
                          <Data
                            data={JSON.stringify(instruction.parsed, null, 2)}
                          ></Data>
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
                      <Address pubkey={account} />
                    </TableCell>
                  </TableRow>
                ))}
              {"data" in instruction && (
                <TableRow key={`data-${index}`}>
                  <TableCell className="align-top">Data</TableCell>
                  <TableCell>
                    <ParseInstruction
                      programId={instruction.programId}
                      data={instruction.data}
                    />
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
      </div>
    </>
  );
}
