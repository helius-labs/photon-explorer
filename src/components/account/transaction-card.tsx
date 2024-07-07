import { timeAgoWithFormat } from "@/utils/common";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import { ConfirmedSignatureInfo, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { CircleArrowDown, ArrowRightLeftIcon, ArrowRight, CircleHelp } from "lucide-react";
import Signature from "@/components/common/signature";
import { ColumnDef } from "@tanstack/react-table";
import { XrayTransaction, ActionTypes, ParserTransactionTypes } from "@/utils/parser";
import { TokenBalance } from "@/components/common/token-balance";
import Address from "@/components/common/address";
import { BalanceDelta } from "@/components/common/balance-delta";
import BigNumber from "bignumber.js";
import { descriptionParser } from "@/utils/parser/parsers/description";
import { DataTable } from "../data-table/data-table";

function isXrayTransaction(transaction: any): transaction is XrayTransaction {
  return (transaction as XrayTransaction).timestamp !== undefined;
}

function isParsedTransactionWithMeta(transaction: any): transaction is ParsedTransactionWithMeta {
  return (transaction as ParsedTransactionWithMeta).transaction !== undefined;
}

function isConfirmedSignatureInfo(transaction: any): transaction is ConfirmedSignatureInfo {
  return (transaction as ConfirmedSignatureInfo).signature !== undefined && !(transaction as SignatureWithMetadata);
}

function isSignatureWithMetadata(transaction: any): transaction is SignatureWithMetadata {
  return (transaction as SignatureWithMetadata) !== undefined;
}

type TransactionData = ConfirmedSignatureInfo | SignatureWithMetadata | XrayTransaction | ParsedTransactionWithMeta;

export const columns: ColumnDef<TransactionData>[] = [
  {
    header: () => (
      <div className="px-4 py-2">
        <span className="text-sm font-medium">Timestamp</span>
      </div>
    ),
    accessorKey: "blockTime",
    cell: ({ row }) => {
      const transaction = row.original;
      let time: number | undefined;

      if (isParsedTransactionWithMeta(transaction)) {
        time = transaction.blockTime ?? undefined;
      } else if (isXrayTransaction(transaction)) {
        time = transaction.timestamp ?? undefined;
      } else if (isConfirmedSignatureInfo(transaction) || isSignatureWithMetadata(transaction)) {
        time = transaction.blockTime ?? undefined;
      }

      return (
        <div className="flex items-center px-4 py-2 gap-2">
          <CircleArrowDown strokeWidth={1} className="h-8 w-8 md:h-12 md:w-12" />
          <div className="flex flex-col">
            <div className="text-sm font-medium">Completed</div>
            <div className="text-sm text-muted-foreground">
              {time !== undefined ? timeAgoWithFormat(Number(time), true) : ""}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    header: () => (
      <div className="px-4 py-2 text-center mr-20">
        <span className="text-sm font-medium">Type</span>
      </div>
    ),
    accessorKey: "type",
    cell: ({ row }) => {
      const transaction = row.original;
      let description = "";
      let actions: any[] = [];
      let rootAccountDelta: BigNumber | null = null;
      let type = ParserTransactionTypes.UNKNOWN;

      if (isParsedTransactionWithMeta(transaction)) {
        description = transaction.meta?.logMessages?.join(" ") || "";
        rootAccountDelta =
          transaction.meta?.postBalances?.[0] !== undefined &&
          transaction.meta?.preBalances?.[0] !== undefined
            ? new BigNumber(transaction.meta.postBalances[0]).minus(new BigNumber(transaction.meta.preBalances[0]))
            : null;
      } else if (isXrayTransaction(transaction)) {
        description = descriptionParser(transaction.description || ""); // Use descriptionParser
        actions = transaction.actions || [];
        type = transaction.type;
      }

      let typeIcon;
      switch (type) {
        case ParserTransactionTypes.SWAP:
          typeIcon = <ArrowRightLeftIcon className="h-6 w-6" />;
          break;
        case ParserTransactionTypes.TRANSFER:
          typeIcon = <ArrowRight className="h-6 w-6" />;
          break;
        case ParserTransactionTypes.UNKNOWN:
        default:
          typeIcon = <CircleHelp className="h-6 w-6" />;
          break;
      }

      return (
        <div className="flex items-center px-4 py-2 md:ml-20 gap-2">
          <div className="h-8 w-8 md:h-12 md:w-12 flex items-center justify-center">
            {typeIcon}
          </div>
          <div className="flex flex-col overflow-hidden">
            {type !== ParserTransactionTypes.UNKNOWN && <div className="text-lg font-bold truncate">{type}</div>}
            {description && actions.length === 0 ? (
              <div className="text-sm text-muted-foreground whitespace-normal break-words">{description}</div>
            ) : (
              <>
                {actions.map((action, index) => (
                  <div key={index} className="truncate">
                    {action.actionType === ActionTypes.TRANSFER && action.mint && action.to && (
                      <div className="flex items-center overflow-hidden text-ellipsis truncate">
                        <span className="text-sm font-medium leading-none">Transfer</span>
                        <TokenBalance amount={action.amount} decimals={action.decimals} mint={new PublicKey(action.mint)} />
                        <Address pubkey={new PublicKey(action.to)} />
                      </div>
                    )}
                    {action.actionType === ActionTypes.SENT && action.mint && action.to && (
                      <div className="flex items-center overflow-hidden text-ellipsis truncate">
                        <span className="text-sm font-medium leading-none">Sent</span>
                        <TokenBalance amount={action.amount} decimals={action.decimals} mint={new PublicKey(action.mint)} />
                        <Address pubkey={new PublicKey(action.to)} />
                      </div>
                    )}
                    {action.actionType === ActionTypes.RECEIVED && action.mint && action.from && (
                      <div className="flex items-center overflow-hidden text-ellipsis truncate">
                        <span className="text-sm font-medium leading-none">Received</span>
                        <TokenBalance amount={action.amount} decimals={action.decimals} mint={new PublicKey(action.mint)} />
                        <Address pubkey={new PublicKey(action.from)} />
                      </div>
                    )}
                  </div>
                ))}
                {rootAccountDelta && (
                  <div className="flex items-center overflow-hidden text-ellipsis truncate">
                    <span className="text-sm font-medium leading-none">Balance Change</span>
                    <BalanceDelta delta={rootAccountDelta} isSol />
                  </div>
                )}
                {type === ParserTransactionTypes.UNKNOWN && !description && actions.length === 0 && (
                  <div className="text-sm text-muted-foreground truncate">UNKNOWN</div>
                )}
              </>
            )}
          </div>
        </div>
      );
    },
  },
  {
    header: () => (
      <div className="px-4 py-2 text-right">
        <span className="text-sm font-medium justify-end">Signature</span>
      </div>
    ),
    accessorKey: "signature",
    cell: ({ getValue, row }) => {
      const transaction = row.original;
      const description = isParsedTransactionWithMeta(transaction)
        ? transaction.meta?.logMessages?.join(" ")
        : isXrayTransaction(transaction)
        ? descriptionParser(transaction.description || "")
        : "";
      return (
        <div className="flex flex-col px-4 py-2 items-end gap-1 overflow-hidden">
          <div className="text-sm text-muted-foreground text-right">Details:</div>
          <div className="text-sm font-medium leading-none truncate">
            <Signature copy={false} signature={getValue() as string} />
          </div>
          {description && (
            <div className="text-sm text-muted-foreground whitespace-normal text-right break-words">{description}</div>
          )}
        </div>
      );
    },
  },
];

export function TransactionCard({ data }: { data: TransactionData[] }) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <DataTable columns={columns} data={data} />
      </div>
      <div className="block md:hidden">
        {data.map((transaction, index) => {
          const isParsedTransaction = isParsedTransactionWithMeta(transaction);
          const isXrayTrans = isXrayTransaction(transaction);

          const time = isParsedTransaction ? transaction.blockTime : isXrayTrans ? transaction.timestamp : undefined;
          const description = isParsedTransaction
            ? transaction.meta?.logMessages?.join(" ")
            : isXrayTrans
            ? descriptionParser(transaction.description || "")
            : undefined;
          const rootAccountDelta = isParsedTransaction && transaction.meta
            ? new BigNumber(transaction.meta.postBalances[0]).minus(new BigNumber(transaction.meta.preBalances[0]))
            : null;

          let typeIcon;
          let typeText = "UNKNOWN";
          if (isXrayTrans) {
            switch (transaction.type) {
              case ParserTransactionTypes.SWAP:
                typeIcon = <ArrowRightLeftIcon className="h-6 w-6" />;
                typeText = "SWAP";
                break;
              case ParserTransactionTypes.TRANSFER:
                typeIcon = <ArrowRight className="h-6 w-6" />;
                typeText = "TRANSFER";
                break;
              case ParserTransactionTypes.UNKNOWN:
              default:
                typeIcon = <CircleHelp className="h-6 w-6" />;
                break;
            }
          }

          return (
            <div key={index} className="border-b pb-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <CircleArrowDown strokeWidth={1} className="h-8 w-8" />
                  <div>
                    <div className="text-sm font-base leading-none">Completed</div>
                    <div className="text-sm text-muted-foreground">
                      {time ? timeAgoWithFormat(Number(time), true) : ""}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-muted-foreground">Details:</div>
                  <div className="text-sm font-base leading-none">
                    <Signature copy={false} signature={"signature" in transaction ? transaction.signature : ""} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-start">
                <div className="h-8 w-8 flex items-center justify-center">{typeIcon}</div>
                <div className="grid gap-1 text-left">
                  {typeText !== "UNKNOWN" && <div className="text-lg font-bold">{typeText}</div>}
                  {description ? (
                    <div className="text-sm text-muted-foreground whitespace-normal break-words">{description}</div>
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
    </>
  );
}
