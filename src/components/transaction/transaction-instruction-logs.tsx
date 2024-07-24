import { ParsedTransactionWithMeta } from "@solana/web3.js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionInstructionLogs({
  data,
}: {
  data: ParsedTransactionWithMeta;
}) {
  return (
    <div className="mx-[-1rem] md:mx-0 overflow-x-auto">
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Program Instruction Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <pre className="whitespace-pre-wrap">
            {data.meta &&
              data.meta.logMessages &&
              data.meta.logMessages.length > 0 &&
              JSON.stringify(data.meta.logMessages, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
