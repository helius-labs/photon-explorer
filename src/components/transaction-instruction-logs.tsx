"use client";

import { Result } from "@/schemas/getTransaction";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionInstructionLogs({
  result,
}: {
  result: Result;
}) {
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Program Instruction Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result.meta.logMessages, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </>
  );
}
