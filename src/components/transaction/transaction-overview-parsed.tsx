import { dateFormat, timeAgoWithFormat, shorten, isSolanaAccountAddress } from "@/utils/common";
import {
  ActionTypes,
  ParserTransactionTypes,
  XrayTransaction,
} from "@/utils/parser";
import { PublicKey } from "@solana/web3.js";
import Link from 'next/link';
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
  const { timestamp, type, source, actions, signature, account, description } = data;

  // Function to shorten all public key strings within the description and wrap with Link
  const renderDescription = (desc: string) => {
    return desc.split(/([1-9A-HJ-NP-Za-km-z]{32,44})/g).map((part, index) => {
      if (isSolanaAccountAddress(part)) {
        const shortened = shorten(part);
        return (
          <Link key={index} href={`/address/${part}`} className="hover:underline" title={part}>
            {shortened}
          </Link>
        );
      }
      return part;
    });
  };

  // Render the description with shortened public key strings and links
  const renderedDescription = description ? renderDescription(description) : "";

  return (
    <Card className="mx-auto w-full max-w-lg p-3 md:p-6 cursor-default">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center space-x-3">
          {type === ParserTransactionTypes.SWAP && <ArrowRightLeftIcon className="h-6 w-6" />}
          {type === ParserTransactionTypes.TRANSFER && <ArrowRight className="h-6 w-6" />}
          {type === ParserTransactionTypes.UNKNOWN && <CircleHelp className="h-6 w-6" />}
          {type === ParserTransactionTypes.BURN && <Flame className="h-6 w-6" />}
          {type === ParserTransactionTypes.TOKEN_MINT && <Printer className="h-6 w-6" />}
          <CardTitle className="text-xl md:text-2xl font-bold">{type}</CardTitle>
        </div>

        <div className="flex flex-col text-left md:text-right mt-2 md:mt-0">
          <span>{timeAgoWithFormat(timestamp, true)}</span>
          <span className="text-xs text-muted-foreground">{dateFormat(timestamp)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator className="mb-4" />
        <div className="space-y-4">
          <span className="text-sm break-words">{renderedDescription}</span>
        </div>
        <Separator className="my-4" />
      </CardContent>

      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <span className="w-full md:w-1/4 text-muted-foreground">Account</span>
          <span className="ml-2 w-full md:w-3/4 break-words">
            <Link href={`/address/${account}`} className="hover:underline" title={account}>
              <Address pubkey={new PublicKey(account)} />
            </Link>
          </span>
        </div>

        {actions.map((action, index) => (
          <div key={index} className="space-y-4">
            {action.actionType === ActionTypes.TRANSFER && (
              <>
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <span className="w-full md:w-1/4 text-muted-foreground">Sent</span>
                  <span className="ml-2 w-full md:w-3/4 break-words">
                    <Link href={`/address/${action.mint}`} className="hover:underline" title={action.mint}>
                      <TokenBalance
                        amount={action.amount}
                        decimals={0}
                        mint={new PublicKey(action.mint!)}
                        isReadable={true}
                      />
                    </Link>
                  </span>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <span className="w-full md:w-1/4 text-muted-foreground">To</span>
                  <span className="ml-2 w-full md:w-3/4 break-words">
                    {action.to ? (
                      <Link href={`/address/${action.to}`} className="hover:underline" title={action.to}>
                        <Address pubkey={new PublicKey(action.to)} />
                      </Link>
                    ) : (
                      "Unknown Address"
                    )}
                  </span>
                </div>
              </>
            )}
            {action.actionType === ActionTypes.SENT && (
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <span className="w-full md:w-1/4 text-muted-foreground">Sent</span>
                <span className="ml-2 w-full md:w-3/4 break-words">
                  <Link href={`/address/${action.mint}`} className="hover:underline" title={action.mint}>
                    <TokenBalance
                      amount={action.amount}
                      decimals={action.decimals}
                      mint={new PublicKey(action.mint!)}
                    />
                  </Link>
                </span>
              </div>
            )}
            {action.actionType === ActionTypes.RECEIVED && (
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <span className="w-full md:w-1/4 text-muted-foreground">Received</span>
                <span className="ml-2 w-full md:w-3/4 break-words">
                  <Link href={`/address/${action.mint}`} className="hover:underline" title={action.mint}>
                    <TokenBalance
                      amount={action.amount}
                      decimals={action.decimals}
                      mint={new PublicKey(action.mint!)}
                    />
                  </Link>
                </span>
              </div>
            )}
            {action.actionType === ActionTypes.BURNT && (
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <span className="w-full md:w-1/4 text-muted-foreground">BURNT</span>
                <span className="ml-2 w-full md:w-3/4 break-words">
                  <Link href={`/address/${action.mint}`} className="hover:underline" title={action.mint}>
                    <TokenBalance
                      amount={action.amount}
                      decimals={0}
                      mint={new PublicKey(action.mint!)}
                      isReadable={true}
                    />
                  </Link>
                </span>
              </div>
            )}
            {action.actionType === ActionTypes.MINT && (
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <span className="w-full md:w-1/4 text-muted-foreground">MINT</span>
                <span className="ml-2 w-full md:w-3/4 break-words">
                  <Link href={`/address/${action.mint}`} className="hover:underline" title={action.mint}>
                    <TokenBalance
                      amount={action.amount}
                      decimals={0}
                      mint={new PublicKey(action.mint!)}
                      isReadable={true}
                    />
                  </Link>
                </span>
              </div>
            )}
          </div>
        ))}
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <span className="w-full md:w-1/4 text-muted-foreground">Program</span>
          <span className="ml-2 w-full md:w-3/4 break-words">
              {source}
          </span>
        </div>

        <Separator />

        <div className="flex flex-col md:flex-row items-start md:items-center">
          <span className="w-full md:w-1/4 text-muted-foreground">Signature</span>
          <div className="flex w-full md:w-3/4 items-center space-x-2 break-words">
            <Signature link={false} signature={signature} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
