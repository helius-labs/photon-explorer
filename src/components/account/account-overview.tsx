"use client";

import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
import { useGetBalance } from "@/hooks/web3";

import Address from "@/components/common/address";
import Data from "@/components/common/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PublicKey } from "@solana/web3.js";
import { SolBalance } from "@/components/common/sol-balance";

export default function AccountOverview({
  address,
  account,
}: {
  address: string;
  account: any;
}) {
  const { data: balance } = useGetBalance(address);
  const { data: compressedBalance } = useGetCompressedBalanceByOwner(address);

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
            <Address pubkey={new PublicKey(address)} />
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Balance</span>
          </div>
          <div className="col-span-3">
            {balance &&
              <SolBalance lamports={balance} />
            }
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Compressed Balance</span>
          </div>
          <div className="col-span-3">
            <span>
              {compressedBalance ? (
                <SolBalance lamports={compressedBalance} />
              ) : (
                <>-</>
              )}
            </span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Allocated Data Size</span>
          </div>
          <div className="col-span-3">
            <span className="font-mono">{account && account.space} byte(s)</span>
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Owner Program</span>
          </div>
          <div className="col-span-3">
            <Address pubkey={account.owner} />
          </div>

          <div className="col-span-1">
            <span className="text-muted-foreground">Executable</span>
          </div>
          <div className="col-span-3">
            <span className="font-mono">{account && account.executable ? "Yes" : "No"}</span>
          </div>

          {account.data.parsed && (
            <>
              <Separator className="col-span-4 my-4" />

              <div className="col-span-1">
                <span className="text-muted-foreground">Type</span>
              </div>
              <div className="col-span-3 capitalize">
                <span className="font-mono">{account.data.parsed.type}</span>
              </div>

              {account.data.program && (
                <>
                  <div className="col-span-1">
                    <span className="text-muted-foreground">Program</span>
                  </div>
                  <div className="col-span-3">
                    <span className="font-mono">{account.data.program}</span>
                  </div>
                </>
              )}

              {account.data.parsed.info.programData && (
                <>
                  <div className="col-span-1">
                    <span className="text-muted-foreground">Program Data</span>
                  </div>
                  <div className="col-span-3">
                    <Data data={account.data.parsed.info.programData} />
                  </div>
                </>
              )}

              {account.data.parsed.info.mint && (
                <>
                  <div className="col-span-1">
                    <span className="text-muted-foreground">Token mint</span>
                  </div>
                  <div className="col-span-3">
                    <Address pubkey={new PublicKey(account.data.parsed.info.mint)} />
                  </div>
                </>
              )}

              {account.data.parsed.info.owner && (
                <>
                  <div className="col-span-1">
                    <span className="text-muted-foreground">Token owner</span>
                  </div>
                  <div className="col-span-3">
                    <Address pubkey={new PublicKey(account.data.parsed.info.owner)} />
                  </div>
                </>
              )}

              {account.data.parsed.info.tokenAmount && (
                <>
                  <div className="col-span-1">
                    <span className="text-muted-foreground">Token balance</span>
                  </div>
                  <div className="col-span-3">
                    <span>
                      {account.data.parsed.info.tokenAmount.uiAmount}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
