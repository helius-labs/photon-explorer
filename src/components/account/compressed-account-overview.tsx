"use client";

import { useGetCompressedBalance } from "@/hooks/compression";

import Address from "@/components/common/address";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicKey } from "@solana/web3.js";
import { SolBalance } from "@/components/common/sol-balance";

export default function CompressedAccountOverview({
  address,
  account,
}: {
  address: string;
  account: any;
}) {
  const { data: compressedBalance } = useGetCompressedBalance(address);

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
            <Address pubkey={new PublicKey(address)} link={false} />
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Type</span>
          </div>
          <div className="col-span-3">
            <span className="font-mono">Compressed Account</span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Owner</span>
          </div>
          <div className="col-span-3">
            <Address pubkey={new PublicKey(account.owner)} />
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Balance</span>
          </div>
          <div className="col-span-3">
            {compressedBalance ?
              (
                <SolBalance lamports={compressedBalance} />
              ) : (
                <span>-</span>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
