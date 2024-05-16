"use client";

import { useGetCompressedAccount } from "@/hooks/compression";
import { useGetAccountInfo } from "@/hooks/web3";
import { RotateCw } from "lucide-react";

import AccountOverview from "@/components/account-overview";
import CompressedAccountOverview from "@/components/compressed-account-overview";
import CompressedAccounts from "@/components/compressed-accounts";
import CompressedTokenAccounts from "@/components/compressed-token-accounts";
import CompressedTransactionsByAddress from "@/components/compressed-transactions-by-address";
import CompressedTransactionsByHash from "@/components/compressed-transactions-by-hash";
import Loading from "@/components/loading";
import TokenAccounts from "@/components/token-accounts";
import Transactions from "@/components/transactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AccountDetails({ address }: { address: string }) {
  const accountInfo = useGetAccountInfo(address);
  const compressedAccount = useGetCompressedAccount(address);

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
            Reload
          </Button>
        </CardContent>
      </Card>
    );
  if (accountInfo.isLoading)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Loading />
        </CardContent>
      </Card>
    );
  if (!accountInfo.account.value && !compressedAccount.account) {
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
            Reload
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (accountInfo.account.value) {
    return (
      <>
        <AccountOverview address={address} account={accountInfo.account} />

        <Tabs defaultValue="transactions">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="compressed-transactions">
              Compressed Transactions
            </TabsTrigger>
            <TabsTrigger value="token-accounts">Token Accounts</TabsTrigger>
            <TabsTrigger value="compressed-accounts">
              Compressed Accounts
            </TabsTrigger>
            <TabsTrigger value="compressed-token-accounts">
              Compressed Token Accounts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <Transactions address={address} />
          </TabsContent>
          <TabsContent value="compressed-transactions">
            <CompressedTransactionsByAddress address={address} />
          </TabsContent>
          <TabsContent value="token-accounts">
            <TokenAccounts address={address} />
          </TabsContent>
          <TabsContent value="compressed-accounts">
            <CompressedAccounts address={address} />
          </TabsContent>
          <TabsContent value="compressed-token-accounts">
            <CompressedTokenAccounts address={address} />
          </TabsContent>
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
