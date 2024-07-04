import { timeAgoWithFormat } from "@/utils/common";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import { ConfirmedSignatureInfo, ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { CircleArrowDown, CircleCheck } from "lucide-react";
import Signature from "@/components/common/signature";
import { ColumnDef } from "@tanstack/react-table";
import { XrayTransaction, ActionTypes } from "@/utils/parser";
import { TokenBalance } from "@/components/common/token-balance";
import Address from "@/components/common/address";
import { BalanceDelta } from "@/components/common/balance-delta";
import { extractKeyPoints } from "@/utils/descriptionParser";
import BigNumber from "bignumber.js";

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
      <div className="flex items-center gap-2">
        <span className="text-sm font-base leading-none">Timestamp</span>
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
        <div className="flex items-center gap-2">
          <CircleArrowDown strokeWidth={1} className="h-8 w-8 md:h-12 md:w-12" />
          <div className="grid gap-1">
            <div className="text-sm font-base leading-none">Completed</div>
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
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-base leading-none">Type</span>
      </div>
    ),
    accessorKey: "type",
    cell: ({ row }) => {
      const transaction = row.original;
      let description = "";
      let actions: any[] = [];
      let rootAccountDelta: BigNumber | null = null;

      if (isParsedTransactionWithMeta(transaction)) {
        description = transaction.meta?.logMessages?.join(' ') || "";
        rootAccountDelta = transaction.meta?.postBalances?.[0] !== undefined && transaction.meta?.preBalances?.[0] !== undefined
          ? new BigNumber(transaction.meta.postBalances[0]).minus(new BigNumber(transaction.meta.preBalances[0]))
          : null;
      } else if (isXrayTransaction(transaction)) {
        description = transaction.description || "";
        actions = transaction.actions;
      }

      return (
        <div className="flex items-center gap-2 md:justify-center">
          <div className="h-8 w-8 md:hidden md:w-12 flex items-start justify-start">
            <CircleCheck strokeWidth={1} className="h-full w-full" />
          </div>
          <div className="grid gap-1 text-center">
            {actions.length === 0 && description ? (
              <div className="text-sm text-muted-foreground">
                {extractKeyPoints(description)}
              </div>
            ) : (
              actions.map((action, index) => (
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
            {!description && actions.length === 0 && (
              <div className="text-sm text-muted-foreground">APP INTERACTION</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    header: () => (
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm font-base leading-none">Signature</span>
      </div>
    ),
    accessorKey: "signature",
    cell: ({ getValue }) => (
      <div className="flex flex-col items-end gap-1">
        <div className="text-sm text-muted-foreground">Details</div>
        <div className="text-sm font-base leading-none">
          <Signature copy={false} signature={getValue() as string} />
        </div>
      </div>
    ),
  },
];
