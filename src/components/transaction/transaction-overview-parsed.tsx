import { dateFormat, timeAgoWithFormat } from "@/utils/common";
import {
  ActionTypes,
  ParserTransactionTypes,
  XrayTransaction,
} from "@/utils/parser";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import {
  ArrowRight,
  ArrowRightLeftIcon,
  CircleHelp,
  Flame,
  Printer,
} from "lucide-react";

import Address from "@/components/common/address";
import Signature from "@/components/common/signature";
import { TokenBalance } from "@/components/common/token-balance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TransactionOverviewParsed({
  data,
}: {
  data: XrayTransaction;
}) {
  const { timestamp, type, source, actions, signature, account, description } =
    data;

  return (
    <Card className="mx-auto w-full max-w-lg p-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          {type === ParserTransactionTypes.SWAP && (
            <ArrowRightLeftIcon className="h-6 w-6" />
          )}
          {type === ParserTransactionTypes.TRANSFER && (
            <ArrowRight className="h-6 w-6" />
          )}
          {type === ParserTransactionTypes.UNKNOWN && (
            <CircleHelp className="h-6 w-6" />
          )}
          {type === ParserTransactionTypes.BURN && (
            <Flame className="h-6 w-6" />
          )}
          {type === ParserTransactionTypes.TOKEN_MINT && (
            <Printer className="h-6 w-6" />
          )}
          <CardTitle className="text-2xl font-bold">{type}</CardTitle>
        </div>

        <div className="flex flex-col text-right">
          <span>{timeAgoWithFormat(timestamp, true)}</span>
          <span className="text-xs text-muted-foreground">
            {dateFormat(timestamp)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator className="mb-4" />
        <div className="space-y-4">
          <span className="text-sm">{description}</span>
        </div>
        <Separator className="my-4" />
      </CardContent>

      <CardContent className="space-y-4">
        <div className="flex items-center">
          <span className="w-1/4 text-muted-foreground">Account</span>
          <span className="ml-2 w-3/4">
            <Address pubkey={new PublicKey(account)} />
          </span>
        </div>

        {actions.map((action, index) => (
          <div key={index} className="space-y-4">
            {action.actionType === ActionTypes.TRANSFER && (
              <>
                <div className="flex items-center">
                  <span className="w-1/4 text-muted-foreground">Sent</span>
                  <span className="ml-2 w-3/4">
                    <TokenBalance
                      amount={action.amount}
                      decimals={0}
                      mint={new PublicKey(action.mint!)}
                      isReadable={true}
                    />
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-1/4 text-muted-foreground">To</span>
                  <span className="ml-2 w-3/4">
                    {action.to ? (
                      <Address pubkey={new PublicKey(action.to)} />
                    ) : (
                      "Unknown Address"
                    )}
                  </span>
                </div>
              </>
            )}
            {action.actionType === ActionTypes.SENT && (
              <div className="flex items-center">
                <span className="w-1/4 text-muted-foreground">Sent</span>
                <span className="ml-2 w-3/4">
                  <TokenBalance
                    amount={action.amount}
                    decimals={action.decimals}
                    mint={new PublicKey(action.mint!)}
                  />
                </span>
              </div>
            )}
            {action.actionType === ActionTypes.RECEIVED && (
              <div className="flex items-center">
                <span className="w-1/4 text-muted-foreground">Received</span>
                <span className="ml-2 w-3/4">
                  <TokenBalance
                    amount={action.amount}
                    decimals={action.decimals}
                    mint={new PublicKey(action.mint!)}
                  />
                </span>
              </div>
            )}
            {action.actionType === ActionTypes.BURNT && (
              <div className="flex items-center">
                <span className="w-1/4 text-muted-foreground">BURNT</span>
                <span className="ml-2 w-3/4">
                  <TokenBalance
                    amount={action.amount}
                    decimals={0}
                    mint={new PublicKey(action.mint!)}
                    isReadable={true}
                  />
                </span>
              </div>
            )}
            {action.actionType === ActionTypes.MINT && (
              <div className="flex items-center">
                <span className="w-1/4 text-muted-foreground">MINT</span>
                <span className="ml-2 w-3/4">
                  <TokenBalance
                    amount={action.amount}
                    decimals={0}
                    mint={new PublicKey(action.mint!)}
                    isReadable={true}
                  />
                </span>
              </div>
            )}
          </div>
        ))}
        <div className="flex items-center">
          <span className="w-1/4 text-muted-foreground">Program</span>
          <span className="ml-2 w-3/4">{source}</span>
        </div>

        <Separator />

        <div className="flex items-center">
          <span className="w-1/4 text-muted-foreground">Signature</span>
          <div className="flex w-3/4 items-center space-x-2">
            <Signature link={false} signature={signature} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
