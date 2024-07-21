import React from 'react';
import { timeAgoWithFormat } from "@/utils/common";
import {
  ActionTypes,
  ParserTransactionTypes,
  XrayTransaction,
} from "@/utils/parser";
import { descriptionParser } from "@/utils/parser/parsers/description";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import {
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
  PublicKey,
} from "@solana/web3.js";
import { ColumnDef } from "@tanstack/react-table";
import BigNumber from "bignumber.js";
import {
  ArrowRight,
  ArrowRightLeftIcon,
  CircleArrowDown,
  CircleChevronRightIcon,
  CircleHelp,
  ImagePlusIcon,
  XCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";

import Address from "@/components/common/address";
import { BalanceDelta } from "@/components/common/balance-delta";
import Signature from "@/components/common/signature";
import { TokenBalance } from "@/components/common/token-balance";

import { DataTable } from "../data-table/data-table";

function isXrayTransaction(transaction: any): transaction is XrayTransaction {
  return (transaction as XrayTransaction).timestamp !== undefined;
}

function isParsedTransactionWithMeta(
  transaction: any,
): transaction is ParsedTransactionWithMeta {
  return (transaction as ParsedTransactionWithMeta).transaction !== undefined;
}

function isConfirmedSignatureInfo(
  transaction: any,
): transaction is ConfirmedSignatureInfo {
  return (
    (transaction as ConfirmedSignatureInfo).signature !== undefined &&
    !(transaction as SignatureWithMetadata)
  );
}

function isSignatureWithMetadata(
  transaction: any,
): transaction is SignatureWithMetadata {
  return (transaction as SignatureWithMetadata) !== undefined;
}

type TransactionData =
  | ConfirmedSignatureInfo
  | SignatureWithMetadata
  | XrayTransaction
  | ParsedTransactionWithMeta;

// Helper function to get signature
function getTransactionSignature(transaction: TransactionData): string {
  if (isConfirmedSignatureInfo(transaction) || isSignatureWithMetadata(transaction)) {
    return transaction.signature;
  } else if (isParsedTransactionWithMeta(transaction)) {
    return transaction.transaction.signatures[0];
  } else if (isXrayTransaction(transaction)) {
    return transaction.signature;
  }
  return "unknown_signature";
}

export const columns: ColumnDef<TransactionData>[] = [
  {
    header: () => (
      <div className="px-4 py-2">
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
      let time: number | undefined;
      console.log("DATA: ");
      //finding failed txn
      let txnFailed = false;
      const transactionWithError = transaction as SignatureWithMetadata & {
        err: any[];
      };

      if (
        isSignatureWithMetadata(transaction) &&
        transactionWithError.err &&
        transactionWithError.err !== null
      ) {
        txnFailed = true;
      }

      if (isParsedTransactionWithMeta(transaction)) {
        description = transaction.meta?.logMessages?.join(" ") || "";
        rootAccountDelta =
          transaction.meta?.postBalances?.[0] !== undefined &&
          transaction.meta?.preBalances?.[0] !== undefined
            ? new BigNumber(transaction.meta.postBalances[0]).minus(
                new BigNumber(transaction.meta.preBalances[0]),
              )
            : null;
      } else if (isXrayTransaction(transaction)) {
        description = descriptionParser(transaction || ""); // Use descriptionParser
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
          typeIcon = <CircleHelp className="h-6 w-6" />;
          break;
        case ParserTransactionTypes.CNFT_MINT:
          typeIcon = <ImagePlusIcon className="h-6 w-6" />;
          break;
        default:
          typeIcon = <CircleChevronRightIcon className="h-6 w-6" />;
          break;
      }
      if (txnFailed) {
        typeIcon = <XCircle className="h-6 w-6" />;
      }
      if (isParsedTransactionWithMeta(transaction)) {
        time = transaction.blockTime ?? undefined;
      } else if (isXrayTransaction(transaction)) {
        time = transaction.timestamp ?? undefined;
      } else if (
        isConfirmedSignatureInfo(transaction) ||
        isSignatureWithMetadata(transaction)
      ) {
        time = transaction.blockTime ?? undefined;
      }

      return (
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center">
            {typeIcon}
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="truncate text-lg font-bold">
              {txnFailed ? "Failed Transaction" : type}
            </div>
            <div className="text-sm text-muted-foreground">
              {time !== undefined ? timeAgoWithFormat(Number(time), true) : ""}
            </div>

            {/* {description && actions.length === 0 ? (
              <div className="whitespace-normal break-words text-sm text-muted-foreground">
                {type === 'SWAP' ? 'Swapped' : description}
              </div>
            ) : ( */}
            <>
              {/* comment out section that provides description info */}
              {/* {actions.map((action, index) => (
                  <div key={index} className="truncate">
                    {action.actionType === ActionTypes.TRANSFER &&
                      action.mint &&
                      action.to && (
                        <div className="flex items-center overflow-hidden truncate text-ellipsis">
                          <span className="text-sm font-medium leading-none">
                            Transfer
                          </span>
                          <TokenBalance
                            amount={action.amount}
                            decimals={action.decimals}
                            mint={new PublicKey(action.mint)}
                          />
                          <Address pubkey={new PublicKey(action.to)} />
                        </div>
                      )}
                    {action.actionType === ActionTypes.SENT &&
                      action.mint &&
                      action.to && (
                        <div className="flex items-center overflow-hidden truncate text-ellipsis">
                          <span className="text-sm font-medium leading-none">
                            Sent
                          </span>
                          <TokenBalance
                            amount={action.amount}
                            decimals={action.decimals}
                            mint={new PublicKey(action.mint)}
                          />
                          <Address pubkey={new PublicKey(action.to)} />
                        </div>
                      )}
                    {action.actionType === ActionTypes.RECEIVED &&
                      action.mint &&
                      action.from && (
                        <div className="flex items-center overflow-hidden truncate text-ellipsis">
                          <span className="text-sm font-medium leading-none">
                            Received
                          </span>
                          <TokenBalance
                            amount={action.amount}
                            decimals={action.decimals}
                            mint={new PublicKey(action.mint)}
                          />
                          <Address pubkey={new PublicKey(action.from)} />
                        </div>
                      )}
                  </div>
                ))} */}
              {rootAccountDelta && (
                <div className="flex items-center overflow-hidden truncate text-ellipsis">
                  <span className="text-sm font-medium leading-none">
                    Balance Change
                  </span>
                  <BalanceDelta delta={rootAccountDelta} isSol />
                </div>
              )}
              {/* {txnFailed ? (
                  <div className="truncate text-sm text-muted-foreground">
                    Failed Transaction
                  </div>
                ) : (
                  type === ParserTransactionTypes.UNKNOWN &&
                  !description &&
                  actions.length === 0 && (
                    <div className="truncate text-sm text-muted-foreground">
                      UNKNOWN
                    </div>
                  )
                )} */}
            </>
            {/* )} */}
          </div>
        </div>
      );
    },
  },
  {
    header: () => (
      <div className="mr-20 px-4 py-2 text-center">
        <span className="justify-end text-sm font-medium">Info</span>
      </div>
    ),
    accessorKey: "Info",
    cell: ({ getValue, row }) => {
      const transaction = row.original;
      let description = "";
      let actions: any[] = [];
      let rootAccountDelta: BigNumber | null = null;
      let type = ParserTransactionTypes.UNKNOWN;
      let time: number | undefined;

      //finding failed txn
      let txnFailed = false;

      // Use type assertion to extend the transaction type with an err property
      const transactionWithError = transaction as SignatureWithMetadata & {
        err: any[];
      };

      let txnFailed = false;
      if (
        isSignatureWithMetadata(transaction) &&
        transactionWithError.err &&
        transactionWithError.err !== null
      ) {
        txnFailed = true;
      }

      if (isParsedTransactionWithMeta(transaction)) {
        description = transaction.meta?.logMessages?.join(" ") || "";
        rootAccountDelta =
          transaction.meta?.postBalances?.[0] !== undefined &&
          transaction.meta?.preBalances?.[0] !== undefined
            ? new BigNumber(transaction.meta.postBalances[0]).minus(
                new BigNumber(transaction.meta.preBalances[0]),
              )
            : null;
      } else if (isXrayTransaction(transaction)) {
        description = descriptionParser(transaction || ""); // Use descriptionParser
        actions = transaction.actions || [];
        type = transaction.type;
        // console.log("ACTIONS", actions);
      }

      return (
        <div className="flex flex-col items-start gap-1 overflow-hidden px-4 py-2 md:ml-20">
          {/* <div className="text-sm text-muted-foreground">
            {time !== undefined ? timeAgoWithFormat(Number(time), true) : ""}
          </div> */}
          {txnFailed && (
            <div className="whitespace-normal break-words text-right text-sm text-muted-foreground">
              {"Failed Transaction"}
            </div>
          )}

          {description && !txnFailed && (
            <div className="whitespace-normal break-words text-right text-sm text-muted-foreground">
              {description}
            </div>
            // <div className="whitespace-normal break-words text-right text-sm text-muted-foreground">
            //   {actions[0]?.actionType === "TRANSFER" ? (
            //     // {actions[0]?.from === }
            //     <TokenBalance
            //       amount={actions[0]?.amount}
            //       decimals={0}
            //       mint={new PublicKey(actions[0]?.mint!)}
            //       isReadable={true}
            //     />
            //   ) : (
            //     "ffs"
            //   )}
            // </div>
          )}
        </div>
      );
    },
  },

  {
    header: () => (
      <div className="px-4 py-2 text-center">
        <span className="justify-end text-sm font-medium">Signature</span>
      </div>
    ),
    accessorKey: "signature",
    cell: ({ getValue, row }) => {
      const transaction = row.original;

      //finding failed txn
      let txnFailed = false;
      // Use type assertion to extend the transaction type with an err property
      const transactionWithError = transaction as SignatureWithMetadata & {
        err: any[];
      };

      if (
        isSignatureWithMetadata(transaction) &&
        transactionWithError.err &&
        transactionWithError.err !== null
      ) {
        txnFailed = true;
      }

      return (
        <div className="flex flex-col items-center gap-1 overflow-hidden px-4 py-2">
          <div className="flex flex-col">
            <div className="text-sm font-medium">
              <Signature copy={false} signature={getValue() as string} />
            </div>
          </div>
        </div>
      );
    },
  },
];

export function TransactionCard({ data }: { data: TransactionData[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <DataTable columns={columns} data={data} />
      </div>
      <div className="block md:hidden">
        {data.map((transaction, index) => {
          const isParsedTransaction = isParsedTransactionWithMeta(transaction);
          const isXrayTrans = isXrayTransaction(transaction);
          const signature = getTransactionSignature(transaction);

          const time = isParsedTransaction
            ? transaction.blockTime
            : isXrayTrans
              ? transaction.timestamp
              : undefined;
          const description = isParsedTransaction
            ? transaction.meta?.logMessages?.join(" ")
            : isXrayTrans
              ? descriptionParser(transaction || "")
              : undefined;
          const rootAccountDelta =
            isParsedTransaction && transaction.meta
              ? new BigNumber(transaction.meta.postBalances[0]).minus(
                  new BigNumber(transaction.meta.preBalances[0]),
                )
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
              case ParserTransactionTypes.CNFT_MINT:
                typeIcon = <ImagePlusIcon className="h-6 w-6" />;
                typeText = "CNFT MINT";
                break;
              case ParserTransactionTypes.UNKNOWN:
              default:
                typeIcon = <CircleHelp className="h-6 w-6" />;
                break;
            }
          }

          return (
            <div key={`${signature}_${index}`} className="mb-3 border-b pb-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircleArrowDown strokeWidth={1} className="h-8 w-8" />
                  <div>
                    <div className="font-base text-sm leading-none">
                      Transaction:
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {time ? timeAgoWithFormat(Number(time), true) : ""}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-muted-foreground">Signature:</div>
                  <div className="font-base text-sm leading-none">
                    <Signature copy={false} signature={signature} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-start gap-2">
                <div className="flex h-8 w-8 items-center justify-center">
                  {typeIcon}
                </div>
                <div className="grid gap-1 text-left">
                  {typeText !== "UNKNOWN" && (
                    <div className="text-lg font-bold">{typeText}</div>
                  )}
                  {description ? (
                    <></>
                  ) : (
                    "actions" in transaction &&
                    transaction.actions.map((action, idx) => (
                      <div key={`${action.actionType}_${idx}`}>
                        {action.actionType === ActionTypes.TRANSFER && (
                          <div className="flex items-center">
                            <span className="text-sm font-medium leading-none">
                              Transfer
                            </span>
                            <TokenBalance
                              amount={action.amount}
                              decimals={action.decimals}
                              mint={new PublicKey(action.mint!)}
                            />
                            {action.to && (
                              <Address pubkey={new PublicKey(action.to!)} />
                            )}
                          </div>
                        )}
                        {action.actionType === ActionTypes.SENT && (
                          <div className="flex items-center">
                            <span className="text-sm font-medium leading-none">
                              Sent
                            </span>
                            <TokenBalance
                              amount={action.amount}
                              decimals={action.decimals}
                              mint={new PublicKey(action.mint!)}
                            />
                            {action.to && (
                              <Address pubkey={new PublicKey(action.to!)} />
                            )}
                          </div>
                        )}
                        {action.actionType === ActionTypes.RECEIVED && (
                          <div className="flex items-center">
                            <span className="text-sm font-medium leading-none">
                              Received
                            </span>
                            <TokenBalance
                              amount={action.amount}
                              decimals={action.decimals}
                              mint={new PublicKey(action.mint!)}
                            />
                            {action.from && (
                              <Address pubkey={new PublicKey(action.from!)} />
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {rootAccountDelta && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium leading-none">
                        Balance Change
                      </span>
                      <BalanceDelta delta={rootAccountDelta} isSol />
                    </div>
                  )}
                  {!description &&
                    !(
                      "actions" in transaction && transaction.actions.length
                    ) && (
                      <div className="text-sm text-muted-foreground">
                        UNKNOWN
                      </div>
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
