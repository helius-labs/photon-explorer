"use client";

import { RotateCw } from "lucide-react";

import { useGetCompressedAccount } from "@/hooks/compression";
import { useGetTokenListAll } from "@/hooks/tokenlist";
import { useGetAccountInfo } from "@/hooks/web3";

import AccountOverview from "@/components/account-overview";
import CompressedAccountOverview from "@/components/compressed-account-overview";
import CompressedTransactionsByHash from "@/components/compressed-transactions-by-hash";
import Tokens from "@/components/tokens";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AccountDetails({ address }: { address: string }) {
  const accountInfo = useGetAccountInfo(address);
  const compressedAccount = useGetCompressedAccount(address);

  // Preload token list
  useGetTokenListAll();

  if (accountInfo.isError)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div>Failed to load</div>
          <Button
            size="sm"
            className="ml-4"
            onClick={() => {
              accountInfo.refetch();
              compressedAccount.refetch();
            }}
          >
            <RotateCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  if (accountInfo.isLoading || accountInfo.isRefetching)
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-6 w-[200px]" />
        </div>
      </div>
    );
  if (!accountInfo.data.value && !compressedAccount.account) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <span>Account not found</span>
          <Button
            size="sm"
            className="ml-4"
            onClick={() => {
              accountInfo.refetch();
              compressedAccount.refetch();
            }}
          >
            <RotateCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  // TODO Improve Loading UI with suspense

  if (accountInfo.data.value) {
    return (
      <>
        <AccountOverview address={address} accountInfo={accountInfo} />

        <Tabs defaultValue="tokens">
          <TabsList>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="tokens">
            <Tokens address={address} />
          </TabsContent>
          <TabsContent value="nfts">TODO</TabsContent>
          <TabsContent value="history">TODO</TabsContent>
          {/* <TabsContent value="compressed-accounts">
            <CompressedAccounts address={address} />
          </TabsContent>
          <TabsContent value="compressed-token-accounts">
            <CompressedTokenAccounts address={address} />
          </TabsContent> */}
        </Tabs>
      </>
    );
  }

  if (compressedAccount.account) {
    return (
      <>
        <CompressedAccountOverview
          address={address}
          account={compressedAccount.account}
        />

        <Tabs defaultValue="compressed-transactions">
          <TabsList>
            <TabsTrigger value="compressed-transactions">
              Compressed Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compressed-transactions">
            <CompressedTransactionsByHash hash={address} />
          </TabsContent>
        </Tabs>
      </>
    );
  }
}
