import { useCluster } from "@/providers/cluster-provider";
import { AccountType, getAccountType } from "@/utils/account";
import { Cluster } from "@/utils/cluster";
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
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import BigNumber from "bignumber.js";
import {
  ArrowRight,
  ArrowRightLeftIcon,
  CircleCheckBig,
  CircleChevronRightIcon,
  CircleDollarSignIcon,
  CircleHelp,
  Flame,
  ForwardIcon,
  ImagePlusIcon,
  SquareArrowOutUpRightIcon,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import React from "react";

import { useGetAccountInfo, useGetSignaturesForAddress } from "@/hooks/web3";

import Address from "@/components/common/address";
import { BalanceDelta } from "@/components/common/balance-delta";
import Signature from "@/components/common/signature";
import { TokenBalance } from "@/components/common/token-balance";
import transactionBreakdown from "@/components/common/txn-history-desc";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

import TransactionBalances from "../common/txn-history-balance";
import { DataTable } from "../data-table/data-table";

interface TransactionCardProps {
  data: TransactionData[];
  pagination: { pageIndex: number; pageSize: number };
  onPageChange: (newPageIndex: number) => void;
  loadedPages: Set<number>;
}

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

function getSignature(transaction: TransactionData): string {
  if (isSignatureWithMetadata(transaction)) {
    return transaction.signature;
  }
  if (isConfirmedSignatureInfo(transaction)) {
    return transaction.signature;
  }
  if (isParsedTransactionWithMeta(transaction)) {
    return transaction.transaction.signatures[0];
  }
  return "";
}

export const getColumns = (
  address: string,
  isWallet: boolean,
  cluster: Cluster,
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
      let signature = getSignature(transaction);

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
      if (isParsedTransactionWithMeta(transaction) && transaction.meta?.err) {
        txnFailed = true;
      }
      if (
        isXrayTransaction(transaction) &&
        transaction.transactionError != null
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
          typeIcon = txnFailed ? (
            <XCircle className="h-6 w-6" />
          ) : (
            <CircleCheckBig className="h-6 w-6" />
          );
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
        case ParserTransactionTypes.CNFT_TRANSFER:
          typeIcon = <ArrowRight className="h-6 w-6" />;
          break;
        case ParserTransactionTypes.NFT_SALE:
          typeIcon = <CircleDollarSignIcon className="h-6 w-6" />;
          break;
        case ParserTransactionTypes.NFT_LISTING:
          typeIcon = <ForwardIcon className="h-6 w-6" />;
          break;
        case ParserTransactionTypes.NFT_MINT:
          typeIcon = <ImagePlusIcon className="h-6 w-6" />;
          break;
        case ParserTransactionTypes.CNFT_BURN:
          typeIcon = <Flame className="h-6 w-6" />;
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
        <Link href={`/tx/${signature}?cluster=${cluster}`}>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center">
              {typeIcon}
            </div>
            <div className="flex flex-col overflow-hidden">
              <div className="truncate text-lg font-bold">
                {txnFailed
                  ? "Failed Transaction"
                  : type === ParserTransactionTypes.UNKNOWN
                    ? "Generic Transaction"
                    : type}
              </div>
              <div
                className="flex items-center text-sm text-muted-foreground"
                title={
                  time !== undefined
                    ? timeAgoWithFormat(Number(time), false, true)
                    : ""
                }
              >
                {time !== undefined
                  ? timeAgoWithFormat(Number(time), true, false)
                  : ""}
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
        </Link>
      );
    },
  },

  //conditional column depending on if the page is for a wallet or not
  ...(isWallet
    ? [
        {
          header: () => (
            <div className="px-4 py-2 text-start">
              <span className="text-sm font-medium">Balance Changes</span>
            </div>
          ),
          accessorKey: "Balance Changes",
          cell: ({ row }: { row: any }) => {
            const transaction = row.original;
            let signature = getSignature(transaction);

            return (
              <Link href={`/tx/${signature}?cluster=${cluster}`}>
                <div className="px-4 py-2 text-left">
                  <div>{TransactionBalances(transaction, address)} </div>
                </div>
              </Link>
            );
          },
        },
      ]
    : [
        {
          header: () => (
            <div className="ml-10 px-4 py-2 text-start">
              <span className="text-sm font-medium">Info</span>
            </div>
          ),
          accessorKey: "Info",
          cell: ({ row }: { row: any }) => {
            const transaction = row.original;
            let description;
            let actions: any[] = [];
            let rootAccountDelta: BigNumber | null = null;
            let type = ParserTransactionTypes.UNKNOWN;
            let time: number | undefined;
            let signature = getSignature(transaction);

            let txnFailed = false;

            // Use type assertion to extend the transaction type with an err property
            const transactionWithError =
              transaction as SignatureWithMetadata & {
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
              <Link href={`/tx/${signature}?cluster=${cluster}`}>
                <div className="flex flex-col items-start overflow-hidden py-2">
                  {txnFailed ? (
                    <div className="whitespace-normal break-words text-sm text-muted-foreground">
                      {"Transaction failed"}
                    </div>
                  ) : !description ? (
                    <div className="whitespace-normal break-words text-sm text-muted-foreground">
                      {""}
                    </div>
                  ) : (
                    <div className="whitespace-normal break-words text-sm text-muted-foreground">
                      {isXrayTransaction(transaction) &&
                        transactionBreakdown(transaction, address)}
                    </div>
                  )}
                </div>
              </Link>
            );
          },
        },
      ]),
  {
    header: () => (
      <div className="px-4 py-2 text-left">
        <span className="hidden text-sm font-medium md:block">Signature</span>
      </div>
    ),
    accessorKey: "signature",
    cell: ({ getValue, row }) => {
      const transaction = row.original;
      let signature = getSignature(transaction);

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
        <Link href={`/tx/${signature}?cluster=${cluster}`}>
          <div className="items-left flex flex-col gap-1 overflow-hidden px-4 py-2">
            <div className="flex flex-col">
              <div className="items-left flex text-sm font-medium underline">
                <Signature
                  link={false}
                  copy={false}
                  signature={getValue() as string}
                />
              </div>
            </div>
          </div>
        </Link>
      );
    },
  },
];

export function TransactionCard({
  data,
  pagination,
  onPageChange,
  loadedPages,
}: TransactionCardProps) {
  const pathname = usePathname();
  const address = pathname.split("/")[2];
  const pageType = pathname.split("/")[1];
  const { cluster } = useCluster();

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

  const columns = getColumns(address, isWallet, cluster);

  const { pageSize } = pagination;

  // Create the table using useReactTable hook
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(data.length / pageSize),
    state: {
      pagination,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater(pagination);
        onPageChange(newPagination.pageIndex);
      }
    },
  });

  // Ensure we always have pageSize number of items
  const paddedData = [...data, ...Array(pageSize).fill(null)].slice(
    0,
    pageSize,
  );

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <DataTable
          columns={columns}
          data={data}
          pagination={pagination}
          onPageChange={onPageChange}
          manualPagination={true}
          loadedPages={loadedPages}
        />
      </div>
      <div className="block md:hidden">
        {paddedData.map((transaction, index) => (
          <React.Fragment key={transaction?.signature || `empty-${index}`}>
            {transaction ? (
              <TransactionRow transaction={transaction} />
            ) : (
              <EmptyTransactionRow />
            )}
            {index < pageSize - 1 && (
              <div className="border-bg-popover border-t" />
            )}
          </React.Fragment>
        ))}
        <div className="mt-4 flex justify-center">
          <DataTablePagination
            table={table}
            onPageChange={onPageChange}
            manualPagination={true}
            loadedPages={loadedPages}
          />
        </div>
      </div>
    </>
  );
}

function TransactionRow({ transaction }: { transaction: TransactionData }) {
  const pathname = usePathname();
  const address = pathname.split("/")[2];
  const pageType = pathname.split("/")[1];
  const { cluster } = useCluster();

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

  const isParsedTransaction = isParsedTransactionWithMeta(transaction);
  const isXrayTrans = isXrayTransaction(transaction);

  let type = ParserTransactionTypes.UNKNOWN;
  let time: number | undefined;

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
    time = transaction.blockTime ?? undefined;
  } else if (isXrayTrans) {
    time = transaction.timestamp ?? undefined;
    type = transaction.type;
  } else if (
    isConfirmedSignatureInfo(transaction) ||
    isSignatureWithMetadata(transaction)
  ) {
    time = transaction.blockTime ?? undefined;
  }

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
  let typeText = "Generic Transaction";

  switch (type) {
    case ParserTransactionTypes.SWAP:
      typeIcon = <ArrowRightLeftIcon className="h-6 w-6" />;
      typeText = "SWAP";
      break;
    case ParserTransactionTypes.TRANSFER:
      typeIcon = <ArrowRight className="h-6 w-6" />;
      typeText = "TRANSFER";
      break;
    case ParserTransactionTypes.CNFT_TRANSFER:
      typeIcon = <ArrowRight className="h-6 w-6" />;
      typeText = "CNFT TRANSFER";
      break;
    case ParserTransactionTypes.CNFT_MINT:
      typeIcon = <ImagePlusIcon className="h-6 w-6" />;
      typeText = "CNFT MINT";
      break;
    default:
      typeIcon = txnFailed ? (
        <XCircle className="h-6 w-6" />
      ) : (
        <CircleCheckBig className="h-6 w-6" />
      );
      typeText = txnFailed ? "Failed Transaction" : "Generic Transaction";
      break;
  }

  return (
    <div className="mb-3 border-b pb-3">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center">
            {typeIcon}
          </div>
          <div>
            <div className="font-base text-lg font-bold">
              {txnFailed ? "Failed Transaction" : typeText}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              {time !== undefined ? timeAgoWithFormat(Number(time), true) : ""}
              <Link
                href={`/tx/${getSignature(transaction)}?cluster=${cluster}`}
                className="ml-2 flex items-center text-sm text-muted-foreground"
              >
                <SquareArrowOutUpRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        {!isWallet && rootAccountDelta && (
          <div className="flex flex-col items-center">
            <span className="text-lg font-medium leading-none">
              Balance Change
            </span>
            <BalanceDelta delta={rootAccountDelta} isSol />
          </div>
        )}
      </div>
      {!isWallet && (
        <div className="px-4 py-2 text-center text-sm text-muted-foreground">
          <div>
            {txnFailed
              ? "Transaction failed"
              : !description
                ? "Transaction could not be parsed"
                : isXrayTrans
                  ? transactionBreakdown(transaction, address)
                  : description}
          </div>
        </div>
      )}
      {isWallet && (
        <div className="flex justify-center px-4 py-2 text-lg">
          <div>{TransactionBalances(transaction, address)}</div>
        </div>
      )}
    </div>
  );
}

function EmptyTransactionRow() {
  return (
    <div className="flex flex-col justify-between px-6 py-3 md:flex-row md:items-center">
      <div className="mb-4 flex flex-1 items-center space-x-2 md:mb-0">
        {/* Empty content */}
      </div>
      <div className="flex flex-1 items-center justify-center space-x-2">
        {/* Empty content */}
      </div>
      <div className="flex flex-1 items-center justify-center">
        {/* Empty content */}
      </div>
    </div>
  );
}
