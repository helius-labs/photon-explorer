import {
  dateFormat,
  isSolanaAccountAddress,
  shorten,
  timeAgoWithFormat,
} from "@/utils/common";
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
  CircleDollarSignIcon,
  CircleHelp,
  Flame,
  ForwardIcon,
  ImagePlusIcon,
  Printer,
} from "lucide-react";
import Link from "next/link";

import Address from "@/components/common/address";
import Signature from "@/components/common/signature";
import { TokenBalance } from "@/components/common/token-balance";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function isXrayTransaction(transaction: any): transaction is XrayTransaction {
  return (transaction as XrayTransaction).timestamp !== undefined;
}

export default function TransactionOverviewParsed({
  data,
}: {
  data: XrayTransaction;
}) {
  const { timestamp, type, source, actions, signature, account, description } =
    data;

  //finding failed txn
  let txnFailed = false;

  if (isXrayTransaction(data) && data.transactionError != null) {
    txnFailed = true;
  }

  // Function to shorten all public key strings within the description and wrap with Link
  const renderDescription = (desc: string) => {
    return desc.split(/([1-9A-HJ-NP-Za-km-z]{32,44})/g).map((part, index) => {
      if (isSolanaAccountAddress(part)) {
        const shortened = shorten(part);
        return (
          <Link
            key={index}
            href={`/address/${part}`}
            className="hover:underline"
            title={part}
          >
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
    <div className="mx-[-1rem] md:mx-0">
      <Card className="mx-auto w-full max-w-lg cursor-default p-3 md:p-6">
        <CardHeader className="flex flex-col items-start justify-between md:flex-row md:items-center">
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
            {type === ParserTransactionTypes.CNFT_MINT && (
              <ImagePlusIcon className="h-6 w-6" />
            )}
            {type === ParserTransactionTypes.TOKEN_MINT && (
              <Printer className="h-6 w-6" />
            )}
            {type === ParserTransactionTypes.CNFT_TRANSFER && (
              <ArrowRight className="h-6 w-6" />
            )}
            {type === ParserTransactionTypes.NFT_SALE && (
              <CircleDollarSignIcon className="h-6 w-6" />
            )}
            {type === ParserTransactionTypes.NFT_LISTING && (
              <ForwardIcon className="h-6 w-6" />
            )}
            {type === ParserTransactionTypes.NFT_MINT && (
              <ImagePlusIcon className="h-6 w-6" />
            )}
            {type === ParserTransactionTypes.CNFT_BURN && (
              <Flame className="h-6 w-6" />
            )}

            <CardTitle className="text-xl font-bold md:text-2xl">
              {type}
            </CardTitle>
            {txnFailed && (
              <Badge className="px-2 py-1 text-xs" variant="destructive">
                Failed
              </Badge>
            )}
          </div>

          <div className="mt-2 flex flex-col text-left md:mt-0 md:text-right">
            <span>{timeAgoWithFormat(timestamp, true)}</span>
            <span className="text-xs text-muted-foreground">
              {dateFormat(timestamp)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator className="mb-4" />
          <div className="space-y-4">
            <span className="break-words text-sm">{renderedDescription}</span>
          </div>
          <Separator className="my-4" />
        </CardContent>

        <CardContent className="space-y-4">
          <div className="flex flex-col items-start md:flex-row md:items-center">
            <span className="w-full text-muted-foreground md:w-1/4">
              Account
            </span>
            <span className="ml-2 w-full break-words md:w-3/4">
              <Address
                pubkey={new PublicKey(account)}
                link={true}
                showCopyButton={true}
              />
            </span>
          </div>

          {actions.map((action, index) => (
            <div key={index} className="space-y-4">
              {action.actionType === ActionTypes.TRANSFER && (
                <>
                  <div className="flex flex-col items-start md:flex-row md:items-center">
                    <span className="w-full text-muted-foreground md:w-1/4">
                      Sent
                    </span>
                    <span className="ml-2 w-full break-words md:w-3/4">
                      <TokenBalance
                        amount={action.amount}
                        decimals={0}
                        mint={new PublicKey(action.mint!)}
                        isReadable={true}
                        isLink={true}
                        // showPrice={true}
                        // timestamp={timestamp}
                      />
                    </span>
                  </div>
                  <div className="flex flex-col items-start md:flex-row md:items-center">
                    <span className="w-full text-muted-foreground md:w-1/4">
                      To
                    </span>
                    <span className="ml-2 w-full break-words md:w-3/4">
                      {action.to ? (
                        <Address
                          pubkey={new PublicKey(account)}
                          link={true}
                          showCopyButton={true}
                        />
                      ) : (
                        "Unknown Address"
                      )}
                    </span>
                  </div>
                </>
              )}
              {action.actionType === ActionTypes.SENT && (
                <div className="flex flex-col items-start md:flex-row md:items-center">
                  <span className="w-full text-muted-foreground md:w-1/4">
                    Sent
                  </span>
                  <span className="ml-2 w-full break-words md:w-3/4">
                    <TokenBalance
                      amount={action.amount}
                      decimals={action.decimals}
                      mint={new PublicKey(action.mint!)}
                      isLink={true}
                      // showPrice={true}
                      // timestamp={timestamp}
                    />
                  </span>
                </div>
              )}
              {action.actionType === ActionTypes.RECEIVED && (
                <div className="flex flex-col items-start md:flex-row md:items-center">
                  <span className="w-full text-muted-foreground md:w-1/4">
                    Received
                  </span>
                  <span className="ml-2 w-full break-words md:w-3/4">
                    <TokenBalance
                      amount={action.amount}
                      decimals={action.decimals}
                      mint={new PublicKey(action.mint!)}
                      isLink={true}
                      // showPrice={true}
                      // timestamp={timestamp}
                    />
                  </span>
                </div>
              )}
              {action.actionType === ActionTypes.BURNT && (
                <div className="flex flex-col items-start md:flex-row md:items-center">
                  <span className="w-full text-muted-foreground md:w-1/4">
                    BURNT
                  </span>
                  <span className="ml-2 w-full break-words md:w-3/4">
                    <TokenBalance
                      amount={action.amount}
                      decimals={action.decimals || 0}
                      mint={new PublicKey(action.mint!)}
                      isReadable={true}
                      isLink={true}
                      // showPrice={true}
                      // timestamp={timestamp}
                    />
                  </span>
                </div>
              )}
              {action.actionType === ActionTypes.MINT && (
                <div className="flex flex-col items-start md:flex-row md:items-center">
                  <span className="w-full text-muted-foreground md:w-1/4">
                    MINT
                  </span>
                  <span className="ml-2 w-full break-words md:w-3/4">
                    <TokenBalance
                      amount={action.amount}
                      decimals={action.decimals || 0}
                      mint={new PublicKey(action.mint!)}
                      isReadable={true}
                      isLink={true}
                      // showPrice={true}
                      // timestamp={timestamp}
                    />
                  </span>
                </div>
              )}
              {action.actionType === ActionTypes.CNFT_MINT && (
                <div className="flex items-center">
                  <span className="w-1/4 text-muted-foreground">MINT</span>
                  <span className="ml-2 w-3/4">
                    <TokenBalance
                      amount={action.amount}
                      decimals={action.decimals || 0}
                      mint={new PublicKey(action.mint!)}
                      isReadable={true}
                      isLink={true}
                      // showPrice={true}
                      // timestamp={timestamp}
                    />
                  </span>
                </div>
              )}
              {action.actionType === ActionTypes.CNFT_TRANSFER && (
                <>
                  <div className="flex flex-col items-start md:flex-row md:items-center">
                    <span className="w-full text-muted-foreground md:w-1/4">
                      Sent
                    </span>
                    <span className="ml-2 w-full break-words md:w-3/4">
                      <TokenBalance
                        amount={action.amount}
                        decimals={action.decimals || 0}
                        mint={new PublicKey(action.mint!)}
                        isReadable={true}
                        isLink={true}
                        // showPrice={true}
                        // timestamp={timestamp}
                      />
                    </span>
                  </div>
                  <div className="flex flex-col items-start md:flex-row md:items-center">
                    <span className="w-full text-muted-foreground md:w-1/4">
                      To
                    </span>
                    <span className="ml-2 w-full break-words md:w-3/4">
                      {action.to ? (
                        <Address
                          pubkey={new PublicKey(account)}
                          link={true}
                          showCopyButton={true}
                        />
                      ) : (
                        "Unknown Address"
                      )}
                    </span>
                  </div>
                </>
              )}
              {action.actionType === ActionTypes.NFT_SALE && (
                <>
                  <div className="flex flex-col items-start md:flex-row md:items-center">
                    <span className="w-full text-muted-foreground md:w-1/4">
                      Seller
                    </span>
                    <span className="ml-2 w-full break-words md:w-3/4">
                      {action.from ? (
                        <Address
                          pubkey={new PublicKey(account)}
                          link={true}
                          showCopyButton={true}
                        />
                      ) : (
                        "Unknown Address"
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col items-start md:flex-row md:items-center">
                    <span className="w-full text-muted-foreground md:w-1/4">
                      NFT
                    </span>
                    <span className="ml-2 w-full break-words md:w-3/4">
                      <TokenBalance
                        amount={action.amount}
                        decimals={action.decimals || 0}
                        mint={new PublicKey(action.mint!)}
                        isReadable={true}
                        isLink={true}
                        // showPrice={true}
                        // timestamp={timestamp}
                      />
                    </span>
                  </div>
                </>
              )}
              {action.actionType === ActionTypes.PAID && (
                <div className="flex items-center">
                  <span className="w-1/4 text-muted-foreground">Price</span>
                  <span className="ml-2 w-3/4">
                    <TokenBalance
                      amount={action.amount}
                      decimals={action.decimals || 0}
                      mint={new PublicKey(action.mint!)}
                      isReadable={true}
                      isLink={true}
                      // showPrice={true}
                      // timestamp={timestamp}
                    />
                  </span>
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col items-start md:flex-row md:items-center">
            <span className="w-full text-muted-foreground md:w-1/4">
              Program
            </span>
            <span className="ml-2 w-full break-words md:w-3/4">{source}</span>
          </div>

          <Separator />

          <div className="flex flex-col items-start md:flex-row md:items-center">
            <span className="w-full text-muted-foreground md:w-1/4">
              Signature
            </span>
            <div className="flex w-full items-center space-x-2 break-words md:w-3/4">
              <Signature link={true} signature={signature} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
