"use client";

import { useGetCompressionSignaturesForAccount } from "@/hooks/compression";
import { useGetSignaturesForAddress } from "@/hooks/web3";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "@/components/account/transaction-card";
import { ConfirmedSignatureInfo } from "@solana/web3.js";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import { timeAgoWithFormat } from "@/utils/common";
import { CircleArrowDown, CircleCheck } from "lucide-react";
import Signature from "../common/signature";
import { Button } from "../ui/button";
import { useCluster } from "@/providers/cluster-provider";
import { useRouter } from "next/navigation";

export default function AccountHistory({ address }: { address: string }) {
  const signatures = useGetSignaturesForAddress(address);
  const compressionSignatures = useGetCompressionSignaturesForAccount(address);
  
  const router = useRouter();
  const { cluster } = useCluster();
  const handleReturn = () => {
    router.push(`/?cluster=${cluster}`);

  };
  if (signatures.isError)
    return (
      <Card className="col-span-12">
        <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center p-6">
            <div className="text-muted-foreground text-lg">Failed to load transaction history.</div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleReturn}
            >
              Return
            </Button>          
          </div>
        </CardContent>
      </Card>
    );
  
  if (signatures.isLoading || signatures.isPending)
    return (
      <Card className="col-span-12">
        <CardContent className="flex flex-col pt-6 gap-4">
          {[0, 1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );

  const data: (ConfirmedSignatureInfo | SignatureWithMetadata)[] = 
    signatures.data.length > 0 ? signatures.data : compressionSignatures.data || [];

  return (
    <Card className="col-span-12 mb-10">
      <CardContent className="pt-6">
        <div className="hidden md:block">
          <DataTable columns={columns} data={data} />
        </div>
        <div className="block md:hidden">
          {data.map((transaction, index) => (
            <div key={index} className="border-b pb-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <CircleArrowDown strokeWidth={1} className="h-8 w-8" />
                  <div>
                    <div className="text-sm font-base leading-none">Received</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.blockTime ? timeAgoWithFormat(Number(transaction.blockTime), true) : ""}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-muted-foreground">From</div>
                  <div className="text-sm font-base leading-none">
                    <Signature copy={false} signature={transaction.signature} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-start">
                <div className="h-8 w-8 flex items-center justify-center">
                  <CircleCheck strokeWidth={1} className="h-full w-full" />
                </div>
                <div className="grid gap-1 text-center">
                  <div className="text-sm font-medium leading-none">+10 hSOL</div>
                  <div className="text-sm text-muted-foreground">$1500.00</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
