import { CompressedTransaction } from "@lightprotocol/stateless.js";
import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { ArrowRightLeft } from "lucide-react";

import { dateFormat, timeAgoWithFormat } from "@/utils/common";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";

import Address from "@/components/common/address";
import { BalanceDelta } from "@/components/common/balance-delta";
import Signature from "@/components/common/signature";
import { SolBalance } from "@/components/common/sol-balance";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TokenBalance } from "../common/token-balance";
import { Separator } from "../ui/separator";

export default function TransactionOverviewCompressed({
  signature,
  data,
  compressed,
}: {
  signature: string;
  data: ParsedTransactionWithMeta;
  compressed: CompressedTransaction;
}) {
  // TODO: Add zustand store for token list
  const tokenList = useGetTokenListStrict();

  const signer = data.transaction.message.accountKeys.find(
    (account) => account.signer,
  );

  const accountRows = data.transaction.message.accountKeys
    .filter((account) => account.signer)
    .map((account, index) => {
      const pre = data.meta!.preBalances[index];
      const post = data.meta!.postBalances[index];
      const pubkey = account.pubkey;
      const key = account.pubkey.toBase58();
      const delta = new BigNumber(post).minus(new BigNumber(pre));

      return (
        <TableRow key={key}>
          <TableCell>
            <Address pubkey={pubkey} />
          </TableCell>
          <TableCell>
            <BalanceDelta delta={delta} isSol />
          </TableCell>
          <TableCell>
            <SolBalance lamports={post} />
          </TableCell>
        </TableRow>
      );
    });

  const openedAccounts = compressed.compressionInfo.openedAccounts
    .filter((openedAccount) => openedAccount.account.lamports > 0)
    .map((item, index) => {
      const pubkey = new PublicKey(item.account.hash);
      const key = pubkey.toBase58();
      const delta = new BigNumber(item.account.lamports);

      return (
        <TableRow key={key}>
          <TableCell>
            <Address pubkey={pubkey} />
          </TableCell>
          <TableCell>
            <BalanceDelta delta={delta} isSol />
          </TableCell>
          <TableCell>
            <SolBalance lamports={item.account.lamports} />
          </TableCell>
        </TableRow>
      );
    });

  const closedAccounts = compressed.compressionInfo.closedAccounts
    .filter((closedAccount) => closedAccount.account.lamports > 0)
    .map((item, index) => {
      const pubkey = new PublicKey(item.account.hash);
      const key = pubkey.toBase58();
      const delta = new BigNumber(item.account.lamports * -1);

      return (
        <TableRow key={key}>
          <TableCell>
            <Address pubkey={pubkey} />
          </TableCell>
          <TableCell>
            <BalanceDelta delta={delta} isSol />
          </TableCell>
          <TableCell>
            <SolBalance lamports={0} />
          </TableCell>
        </TableRow>
      );
    });

  const openedTokenAccounts = compressed.compressionInfo.openedAccounts
    .filter((openedAccount) => openedAccount.account.lamports.toNumber() === 0)
    .map((item, index) => {
      if (
        item.maybeTokenData &&
        item.maybeTokenData.owner.toBase58() === signer?.pubkey.toBase58()
      ) {
        return (
          <TableRow key={`opened-token-accounts-${index}`}>
            <TableCell>
              <Address pubkey={item.maybeTokenData.owner} />
            </TableCell>
            <TableCell>
              <TokenBalance
                mint={new PublicKey(item.maybeTokenData.mint)}
                amount={item.maybeTokenData.amount}
                tokenList={tokenList}
              />
            </TableCell>
            <TableCell>
              <TokenBalance
                mint={new PublicKey(item.maybeTokenData.mint)}
                amount={item.maybeTokenData.amount}
                tokenList={tokenList}
              />
            </TableCell>
          </TableRow>
        );
      }
    });

  return (
    <Card className="w-full mx-auto p-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <ArrowRightLeft className="h-6 w-6" />
          <CardTitle className="text-2xl font-bold">Transaction</CardTitle>
          <Badge
            className="text-xs py-1 px-2"
            variant={data.meta?.err === null ? "success" : "destructive"}
          >
            {data.meta?.err === null ? "Success" : "Failed"}
          </Badge>
        </div>
        <div className="flex flex-col text-right">
          <span>{timeAgoWithFormat(data.blockTime!, true)}</span>
          <span className="text-xs text-muted-foreground">
            {dateFormat(data.blockTime!)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <Table className="mb-8">
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Post Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountRows}
            {openedAccounts}
            {closedAccounts}
            {openedTokenAccounts}
          </TableBody>
        </Table>

        <Separator />

        <div className="flex align-center">
          <span className="text-muted-foreground mr-4">Signature</span>
          <div className="flex items-center space-x-2">
            <Signature link={false} signature={signature} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
