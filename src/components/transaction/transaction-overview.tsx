
import { timeAgoWithFormat } from "@/utils/common";

import Signature from "@/components/common/signature";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompressedTransaction } from "@lightprotocol/stateless.js";
import { ParsedTransactionWithMeta } from "@solana/web3.js";
import { SolBalance } from "@/components/common/sol-balance";
import { Slot } from "@/components/common/slot";
import { statuses } from "@/utils/data";
import { useGetSignatureStatus } from "@/hooks/web3";

export default function TransactionOverviewCompressed({
  signature,
  data,
  compressed,
}: {
  signature: string;
  data: ParsedTransactionWithMeta;
  compressed: CompressedTransaction | null;
}) {
  const { data: signatureStatus } = useGetSignatureStatus(signature);

  const status = statuses.find(status => status.value === !data?.meta?.err);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1">
            <div className="flex items-center">
              <span className="mr-1 text-muted-foreground">Signature</span>
            </div>
          </div>
          <div className="col-span-3">
            {signature && (
              <Signature link={false} signature={signature} />
            )}
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Status</span>
          </div>
          <div className="col-span-3">
            {status && (
              <div className="flex w-[100px] items-center">
                {status.icon && (
                  <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-mono">{status?.label}</span>
              </div>
            )}
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Timestamp</span>
          </div>
          <div className="col-span-3">
            <span className="font-mono">
              {data?.blockTime && timeAgoWithFormat(data?.blockTime)}
            </span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Block</span>
          </div>
          <div className="col-span-3">
            <Slot slot={data?.slot} />
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Transaction Fee</span>
          </div>
          <div className="col-span-3">
            {data?.meta?.fee && (
              <SolBalance lamports={data?.meta?.fee} />
            )}
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Compute units consumed</span>
          </div>
          <div className="col-span-3">
            <span className="font-mono">
              {data?.meta?.computeUnitsConsumed?.toLocaleString('en-US')}
            </span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Transaction Version</span>
          </div>
          <div className="col-span-3">
            <span className="font-mono">
              {data?.version}
            </span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Recent Blockhash</span>
          </div>
          <div className="col-span-3">
            <span className="font-mono">
              {data?.transaction.message.recentBlockhash}
            </span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Confirmation status</span>
          </div>
          <div className="col-span-3">
            <span className="font-mono">
              {signatureStatus?.value?.confirmationStatus}
            </span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Confirmations</span>
          </div>
          <div className="col-span-3">
            <span className="font-mono">
              {signatureStatus?.value?.confirmations || "max"}
            </span>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
