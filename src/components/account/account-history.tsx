"use client";

import { useGetCompressionSignaturesForAccount } from "@/hooks/compression";
import { useGetSignaturesForAddress } from "@/hooks/web3";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "@/components/account/transaction-card";
import { ConfirmedSignatureInfo, PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import { timeAgoWithFormat } from "@/utils/common";
import { CircleArrowDown, CircleCheck } from "lucide-react";
import Signature from "../common/signature";
import { Button } from "../ui/button";
import { useCluster } from "@/providers/cluster-provider";
import { useRouter } from "next/navigation";
import { useGetParsedTransactions } from "@/hooks/parser";
import { Cluster } from "@/utils/cluster";
import { ActionTypes, XrayTransaction } from "@/utils/parser";
import { TokenBalance } from "../common/token-balance";
import Address from "../common/address";
import { BalanceDelta } from "../common/balance-delta";
import BigNumber from "bignumber.js";
import { descriptionParser } from "@/utils/parser/parsers/description";

function isXrayTransaction(transaction: any): transaction is XrayTransaction {
  return (transaction as XrayTransaction).timestamp !== undefined;
}

function isParsedTransactionWithMeta(transaction: any): transaction is ParsedTransactionWithMeta {
  return (transaction as ParsedTransactionWithMeta).transaction !== undefined;
}

type TransactionData = ConfirmedSignatureInfo | SignatureWithMetadata | XrayTransaction | ParsedTransactionWithMeta;

export default function AccountHistory({ address }: { address: string }) {
  const { cluster } = useCluster();
  const router = useRouter();

  const signatures = useGetSignaturesForAddress(address);
  const compressionSignatures = useGetCompressionSignaturesForAccount(address);

  const parsedTransactions = useGetParsedTransactions(
    signatures.data?.map((sig) => sig.signature) || [],
    cluster === Cluster.MainnetBeta || cluster === Cluster.Devnet
  );

  const handleReturn = () => {
    router.push(`/?cluster=${cluster}`);
  };

  if (signatures.isError || parsedTransactions.isError)
    return (
      <Card className="col-span-12">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-6">
            <div className="text-muted-foreground text-lg">Failed to load transaction history.</div>
            <Button variant="outline" className="mt-4" onClick={handleReturn}>
              Return
            </Button>
          </div>
        </CardContent>
      </Card>
    );

  if (signatures.isLoading || parsedTransactions.isLoading)
    return (
      <Card className="col-span-12">
        <CardContent className="flex flex-col pt-6 gap-4">
          {[0, 1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );

  const data: TransactionData[] =
    parsedTransactions.data?.length
      ? parsedTransactions.data
      : signatures.data?.length
      ? signatures.data
      : compressionSignatures.data || [];

  return (
    <Card className="col-span-12 mb-10">
      <CardContent className="pt-6">
        <div className="hidden md:block">
          <DataTable columns={columns} data={data} />
        </div>
        <div className="block md:hidden">
          {data.map((transaction, index) => {
            const isParsedTransaction = isParsedTransactionWithMeta(transaction);
            const isXrayTrans = isXrayTransaction(transaction);

            const time = isParsedTransaction ? transaction.blockTime : isXrayTrans ? transaction.timestamp : undefined;
            const description = isParsedTransaction ? transaction.meta?.logMessages?.join(' ') : isXrayTrans ? descriptionParser(transaction.description || "") : undefined;
            const rootAccountDelta = isParsedTransaction && transaction.meta
              ? new BigNumber(transaction.meta.postBalances[0]).minus(new BigNumber(transaction.meta.preBalances[0]))
              : null;

            return (
              <div key={index} className="border-b pb-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <CircleArrowDown strokeWidth={1} className="h-8 w-8" />
                    <div>
                      <div className="text-sm font-base leading-none">Received</div>
                      <div className="text-sm text-muted-foreground">
                        {time ? timeAgoWithFormat(Number(time), true) : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-muted-foreground">From</div>
                    <div className="text-sm font-base leading-none">
                      <Signature copy={false} signature={"signature" in transaction ? transaction.signature : ""} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-start">
                  <div className="h-8 w-8 flex items-center justify-center">
                    <CircleCheck strokeWidth={1} className="h-full w-full" />
                  </div>
                  <div className="grid gap-1 text-center">
                    {description ? (
                      <div className="text-sm text-muted-foreground">{description}</div>
                    ) : (
                      "actions" in transaction &&
                      transaction.actions.map((action, index) => (
                        <div key={index}>
                          {action.actionType === ActionTypes.TRANSFER && (
                            <div className="flex items-center">
                              <span className="text-sm font-medium leading-none">Transfer</span>
                              <TokenBalance
                                amount={action.amount}
                                decimals={action.decimals}
                                mint={new PublicKey(action.mint!)}
                              />
                              <Address pubkey={new PublicKey(action.to!)} />
                            </div>
                          )}
                          {action.actionType === ActionTypes.SENT && (
                            <div className="flex items-center">
                              <span className="text-sm font-medium leading-none">Sent</span>
                              <TokenBalance
                                amount={action.amount}
                                decimals={action.decimals}
                                mint={new PublicKey(action.mint!)}
                              />
                              <Address pubkey={new PublicKey(action.to!)} />
                            </div>
                          )}
                          {action.actionType === ActionTypes.RECEIVED && (
                            <div className="flex items-center">
                              <span className="text-sm font-medium leading-none">Received</span>
                              <TokenBalance
                                amount={action.amount}
                                decimals={action.decimals}
                                mint={new PublicKey(action.mint!)}
                              />
                              <Address pubkey={new PublicKey(action.from!)} />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {rootAccountDelta && (
                      <div className="flex items-center">
                        <span className="text-sm font-medium leading-none">Balance Change</span>
                        <BalanceDelta delta={rootAccountDelta} isSol />
                      </div>
                    )}
                    {!description && !("actions" in transaction && transaction.actions.length) && (
                      <div className="text-sm text-muted-foreground">UNKNOWN</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
