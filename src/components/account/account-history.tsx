"use client";

import { useGetCompressionSignaturesForAccount } from "@/hooks/compression";
import { useGetSignaturesForAddress } from "@/hooks/web3";

import TransactionCard from "@/components/account/transaction-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountHistory({ address }: { address: string }) {
  const signatures = useGetSignaturesForAddress(address);

  // Load possible compression signatures if this is a compression hash instead of an address
  const compressionSignatures = useGetCompressionSignaturesForAccount(address);

  // First check for non compression signatures
  if (signatures.isError)
    return (
      <Card className="col-span-12">
        <CardContent className="pt-6">
          <div>Failed to load</div>
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

  if (signatures.data.length > 0) {
    return (
      <Card className="col-span-12">
        <CardContent className="grid pt-6 gap-4">
          {signatures.data?.map((transaction) => (
            <TransactionCard
              key={transaction.signature}
              transaction={transaction}
            />
          ))}
        </CardContent>
      </Card>
    );
  } else if (compressionSignatures.data) {
    // If no signatures found, show compression signatures based on the hash (address)
    return (
      <Card className="col-span-12">
        <CardContent className="grid pt-6 gap-4">
          {compressionSignatures.data.map((transaction) => (
            <TransactionCard
              key={transaction.signature}
              transaction={transaction}
            />
          ))}
        </CardContent>
      </Card>
    );
  }
}
