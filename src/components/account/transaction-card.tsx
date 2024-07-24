import { AccountType, getAccountType } from "@/utils/account";
import { timeAgoWithFormat } from "@/utils/common";
import {
  ActionTypes,
  ParserTransactionTypes,
  XrayTransaction,
} from "@/utils/parser";
import { descriptionParser } from "@/utils/parser/parsers/description";
import { addressLabel } from "@/utils/tx";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import {
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { ColumnDef } from "@tanstack/react-table";
import BigNumber from "bignumber.js";
import {
  ArrowRight,
  ArrowRightLeftIcon,
  CircleArrowDown,
  CircleChevronRightIcon,
  CircleHelp,
  Flame,
  ImagePlusIcon,
  XCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useGetAccountInfo, useGetSignaturesForAddress } from "@/hooks/web3";

import Address from "@/components/common/address";
import { BalanceDelta } from "@/components/common/balance-delta";
import Signature from "@/components/common/signature";
import { TokenBalance } from "@/components/common/token-balance";
import transactionBreakdown from "@/components/common/txn-history-desc";

import TransactionBalances from "../common/txn-history-balance";
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

export const getColumns = (
  address: string,
  isWallet: boolean,
): ColumnDef<TransactionData>[] => [
  {
    header: () => (
      <div className="ml-10 px-4 py-2 text-start">
        <span className="justify-center text-sm font-medium">Type</span>
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
        case ParserTransactionTypes.BURN:
          typeIcon = <Flame className="h-6 w-6" />;
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
            <>
              {rootAccountDelta && (
                <div className="flex items-center overflow-hidden truncate text-ellipsis">
                  <span className="text-sm font-medium leading-none">
                    Balance Change
                  </span>
                  <BalanceDelta delta={rootAccountDelta} isSol />
                </div>
              )}
            </>
          </div>
        </div>
      );
    },
  },
  {
    header: () => (
      <div className="px-4 py-2 text-left">
        <span className="justify-end text-sm font-medium">Info</span>
      </div>
    ),
    accessorKey: "Info",
    cell: ({ getValue, row }) => {
      const transaction = row.original;
      let description;
      let actions: any[] = [];
      let rootAccountDelta: BigNumber | null = null;
      let type = ParserTransactionTypes.UNKNOWN;
      let time: number | undefined;

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
        description = descriptionParser(transaction || "");
        actions = transaction.actions || [];
        type = transaction.type;
      }
      return (
        <div className="flex flex-col items-start overflow-hidden py-2 text-left">
          {txnFailed ? (
            <div className="whitespace-normal break-words text-sm text-muted-foreground">
              {"Transaction failed"}
            </div>
          ) : !description ? (
            <div className="whitespace-normal break-words text-sm text-muted-foreground">
              {"Transaction could not be parsed"}
            </div>
          ) : (
            <div className="whitespace-normal break-words text-sm text-muted-foreground">
              {isXrayTransaction(transaction) &&
                transactionBreakdown(transaction, address)}
            </div>
          )}
        </div>
      );
    },
  },
  //conditiona coloumn depending on if the page is for a wallet or not
  ...(isWallet
    ? [
        {
          header: () => (
            <div className="px-4 py-2 text-center">
              <span className="text-sm font-medium">Balance Changes</span>
            </div>
          ),
          accessorKey: "Balance Changes",
          cell: ({ row }: { row: any }) => {
            const transaction = row.original;
            // Cell rendering logic for the new column
            if (isXrayTransaction(transaction)) {
              return (
                <div className="px-4 py-2 text-center">
                  <div>{TransactionBalances(transaction, address)}</div>
                </div>
              );
            } else {
              return <div className=" text-center">See signature for details</div>;
            }
          },
        },
      ]
    : []),
  {
    header: () => (
      <div className="px-4 py-2 text-left">
        <span className="justify-end text-sm font-medium">Signature</span>
      </div>
    ),
    accessorKey: "signature",
    cell: ({ getValue, row }) => {
      const transaction = row.original;

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
  const pathname = usePathname();
  const address = pathname.split("/")[2];

  const signatures = useGetSignaturesForAddress(address, 1);
  const accountInfo = useGetAccountInfo(address);
  const accountType = useMemo(() => {
    if (
      accountInfo.data &&
      accountInfo.data.value !== undefined &&
      signatures.data !== undefined
    ) {
      return getAccountType(accountInfo.data.value, signatures.data);
    }
  }, [accountInfo.data, signatures.data]);
  const isWallet = accountType === AccountType.Wallet;
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <DataTable columns={getColumns(address, isWallet)} data={data} />
      </div>
      <div className="block md:hidden">
        {data.map((transaction, index) => {
          const isParsedTransaction = isParsedTransactionWithMeta(transaction);
          const isXrayTrans = isXrayTransaction(transaction);

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
            <div key={index} className="mb-3 border-b pb-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center">
                    {typeIcon}
                  </div>
                  <div>
                    <div className="font-base text-lg font-bold">
                      {typeText}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {time ? timeAgoWithFormat(Number(time), true) : ""}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-muted-foreground">
                    Signature:
                  </div>
                  <div className="font-base text-sm leading-none">
                    <Signature
                      copy={false}
                      signature={
                        "signature" in transaction ? transaction.signature : ""
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start justify-start gap-2">
                <div className="grid gap-1 text-left">
                  {description && (
                    <div className="whitespace-normal break-words text-sm text-muted-foreground">
                      {isXrayTransaction(transaction)
                        ? transactionBreakdown(transaction)
                        : "Transaction"}
                    </div>
                  )}
                  {!description &&
                    "actions" in transaction &&
                    transaction.actions.map((action, index) => (
                      <div key={index}>
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
                    ))}
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
