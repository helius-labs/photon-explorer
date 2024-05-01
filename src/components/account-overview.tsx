"use client";

import Address from "@/components/address";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetBalance } from "@/lib/web3";

export default function AccountOverview({
  address,
  account,
}: {
  address: string;
  account: any;
}) {
  const { balance } = useGetBalance(address);

  console.log(balance);

  return (
    <Card className="mb-3 w-full">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          <div className="flex items-center">
            <span className="mr-1 text-muted-foreground">Address</span>
          </div>
          <div className="col-span-3">
            <Address short={false}>{address}</Address>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Balance</span>
          </div>
          <div className="col-span-3">
            <span>{balance && (balance.value / 1e9).toFixed(9)} SOL</span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Allocated Data Size</span>
          </div>
          <div className="col-span-3">
            <span>{account.value && account.value.space} byte(s)</span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Owner Program</span>
          </div>
          <div className="col-span-3">
            <Address short={false}>
              {account.value && account.value.owner}
            </Address>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Executable</span>
          </div>
          <div className="col-span-3">
            {account.value && account.value.executable ? "Yes" : "No"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
