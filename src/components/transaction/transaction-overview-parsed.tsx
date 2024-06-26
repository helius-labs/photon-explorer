import { PublicKey } from "@solana/web3.js";
import { ArrowRight, ArrowRightLeftIcon, CircleHelp } from "lucide-react";

import { dateFormat, timeAgoWithFormat } from "@/utils/common";
import {
  ActionTypes,
  ParserTransactionTypes,
  XrayTransaction,
} from "@/utils/parser";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";

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
  const tokenList = useGetTokenListStrict();

  const { timestamp, type, source, actions, signature, account, description } =
    data;

  return (
    <Card className="w-full max-w-lg mx-auto p-3">
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
        {actions.length === 0 && description ? (
          <div className="flex items-center">
            <span className="w-full text-muted-foreground text-sm">
              {description}
            </span>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="w-1/4 text-muted-foreground">Account</span>
            <span className="w-3/4 ml-2">
              <Address pubkey={new PublicKey(account)} />
            </span>
          </div>
        )}

        {actions.map((action, index) => (
          <div key={index} className="space-y-4">
            {action.actionType === ActionTypes.TRANSFER && (
              <>
                <div className="flex items-center">
                  <span className="w-1/4 text-muted-foreground">Sent</span>
                  <span className="w-3/4 ml-2">
                    <TokenBalance
                      amount={action.amount}
                      mint={new PublicKey(action.mint!)}
                      tokenList={tokenList}
                    />
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-1/4 text-muted-foreground">To</span>
                  <span className="w-3/4 ml-2">
                    <Address pubkey={new PublicKey(action.to!)} />
                  </span>
                </div>
              </>
            )}
            {action.actionType === ActionTypes.SENT && (
              <div className="flex items-center">
                <span className="w-1/4 text-muted-foreground">Sent</span>
                <span className="w-3/4 ml-2">
                  <TokenBalance
                    amount={action.amount}
                    mint={new PublicKey(action.mint!)}
                    decimals={action.decimals}
                    tokenList={tokenList}
                  />
                </span>
              </div>
            )}
            {action.actionType === ActionTypes.RECEIVED && (
              <div className="flex items-center">
                <span className="w-1/4 text-muted-foreground">Received</span>
                <span className="w-3/4 ml-2">
                  <TokenBalance
                    amount={action.amount}
                    mint={new PublicKey(action.mint!)}
                    decimals={action.decimals}
                    tokenList={tokenList}
                  />
                </span>
              </div>
            )}
          </div>
        ))}
        <div className="flex items-center">
          <span className="w-1/4 text-muted-foreground">Program</span>
          <span className="w-3/4 ml-2">{source}</span>
        </div>

        <Separator />

        <div className="flex items-center">
          <span className="w-1/4 text-muted-foreground">Signature</span>
          <div className="w-3/4 flex items-center space-x-2">
            <Signature link={false} signature={signature} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
