"use client";

import { useGetCompressedBalance } from "@/hooks/compression";

import Address from "@/components/address";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompressedAccountOverview({
  address,
  account,
}: {
  address: string;
  account: any;
}) {
  const { compressedBalance } = useGetCompressedBalance(address);

  return (
    <Card className="mb-3 w-full">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          <div className="flex items-center">
            <span className="mr-1 text-muted-foreground">Hash</span>
          </div>
          <div className="col-span-3">
            <Address short={false}>{address}</Address>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Type</span>
          </div>
          <div className="col-span-3">Compressed Account</div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Owner</span>
          </div>
          <div className="col-span-3">
            <Address short={false}>
              {account.value && account.value.owner}
            </Address>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Balance</span>
          </div>
          <div className="col-span-3">
            <span>
              {compressedBalance && (compressedBalance.value / 1e9).toFixed(9)}{" "}
              SOL
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
