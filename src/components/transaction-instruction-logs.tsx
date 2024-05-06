"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionInstructionLogs({
  transaction,
}: {
  transaction: any;
}) {
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Program Instruction Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(transaction.meta.logMessages, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </>
  );
}
