"use client";

import { useGetAccountInfo } from "@/lib/web3";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Transactions from "@/components/transactions";
import Transfers from "@/components/transfers";
import AccountOverview from "@/components/account-overview";

export default function AccountDetails({ address }: { address: string }) {
  const { account, isLoading, isError } = useGetAccountInfo(address);

  if (isError)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div>failed to load</div>
        </CardContent>
      </Card>
    );
  if (isLoading)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div>loading...</div>
        </CardContent>
      </Card>
    );
  if (!account)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div>Account not found</div>
        </CardContent>
      </Card>
    );

  return (
    <>
      <AccountOverview address={address} account={account} />

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <Transactions />
        </TabsContent>
        <TabsContent value="transfers">
          <Transfers />
        </TabsContent>
      </Tabs>
    </>
  );
}
