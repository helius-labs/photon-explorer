import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionInstructionLogs({ data }: { data: any }) {
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Program Instruction Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(data.meta.logMessages, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </>
  );
}
