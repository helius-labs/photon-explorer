"use client";

import { RotateCw } from "lucide-react";

import {
  useGetCompressedAccount,
  useGetCompressedAccountsByOwner,
  useGetCompressionSignaturesForAccount,
  useGetCompressionSignaturesForOwner,
} from "@/hooks/compression";
import { useGetTokensByOwner } from "@/hooks/useGetTokensByOwner";
import { useGetAccountInfo, useGetSignaturesForAddress } from "@/hooks/web3";

import CompressedAccounts from "@/components/account/account-compressed-accounts";
import CompressedTransactionsByHash from "@/components/account/account-compressed-transactions-by-hash";
import AccountOverview from "@/components/account/account-overview";
import AccountTokens from "@/components/account/account-tokens";
import Transactions from "@/components/account/account-transactions";
import CompressedAccountOverview from "@/components/account/compressed-account-overview";
import Loading from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AccountDetails({ address }: { address: string }) {
  // Preload tab data
  useGetSignaturesForAddress(address, 1000);
  useGetCompressionSignaturesForOwner(address);
  useGetTokensByOwner(address);
  useGetCompressedAccountsByOwner(address);
  useGetCompressionSignaturesForAccount(address);

  const accountInfo = useGetAccountInfo(address);
  const compressedAccount = useGetCompressedAccount(address);

  if (accountInfo.isError || compressedAccount.isError)
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
  if (accountInfo.isLoading || compressedAccount.isLoading)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Loading />
        </CardContent>
      </Card>
    );

  if (compressedAccount.data) {
    return (
      <>
        <CompressedAccountOverview
          address={address}
          account={compressedAccount.data}
        />

        <Tabs defaultValue="transactions">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <CompressedTransactionsByHash hash={address} />
          </TabsContent>
        </Tabs>
      </>
    );
  }

  if (accountInfo.data) {
    return (
      <>
        <AccountOverview address={address} accountData={accountInfo.data} />

        <Tabs defaultValue="transactions">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="token-accounts">Tokens</TabsTrigger>
            <TabsTrigger value="compressed-accounts">
              Compressed Accounts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <Transactions address={address} />
          </TabsContent>
          <TabsContent value="token-accounts">
            <AccountTokens address={address} />
          </TabsContent>
          <TabsContent value="compressed-accounts">
            <CompressedAccounts address={address} />
          </TabsContent>
        </Tabs>
      </>
    );
  }
}
