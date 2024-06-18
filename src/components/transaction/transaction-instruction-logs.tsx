import { ParsedTransactionWithMeta } from "@solana/web3.js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionInstructionLogs({
  data,
}: {
  data: ParsedTransactionWithMeta;
}) {
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Program Instruction Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap">
            {data.meta &&
              data.meta.logMessages &&
              data.meta.logMessages.length > 0 &&
              JSON.stringify(data.meta.logMessages, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </>
  );
}
