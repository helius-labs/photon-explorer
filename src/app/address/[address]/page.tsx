import type { Metadata } from "next";
import Address from "@/components/address";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Transactions from "@/components/transactions";
import Transfers from "@/components/transfers";

export const metadata: Metadata = {
  title: "Account Details | Photon Block Explorer",
  description: "",
};

export default function Page({ params }: { params: { address: string } }) {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Details</h1>
      </div>

      <Card className="mb-3 w-full">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <div className="flex items-center">
                <span className="mr-1 text-muted-foreground">Address</span>
              </div>
            </div>
            <div className="col-span-3">
              <Address short={false}>
                31Sof5r1xi7dfcaz4x9Kuwm8J9ueAdDduMcme59sP8gc
              </Address>
            </div>

            <div className="col-span-1">
              <span className="text-muted-foreground">Owner Program</span>
            </div>
            <div className="col-span-3">
              <Address short={false}>11111111111111111111111111111111</Address>
            </div>

            <div className="col-span-1">
              <span className="text-muted-foreground">Balance</span>
            </div>
            <div className="col-span-3">
              <span>11.164345859 SOL</span>
            </div>
          </div>
        </CardContent>
      </Card>
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
