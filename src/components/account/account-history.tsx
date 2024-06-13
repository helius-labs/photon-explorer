"use client";

import {
  Signature as SignatureType,
  Slot,
  UnixTimestamp,
} from "@solana/web3.js";

import { useGetSignaturesForAddress } from "@/hooks/web3";

import TransactionCard from "@/components/account/transaction-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountHistory({ address }: { address: string }) {
  type Signature = {
    blockTime: UnixTimestamp | null;
    status: boolean;
    signature: SignatureType;
    slot: Slot;
  };

  const { data, isLoading, isFetching, isPending, isError } =
    useGetSignaturesForAddress(address);

  // const {
  //   data: dataCompressions,
  //   isLoading,
  //   isFetching,
  //   isPending,
  //   isError,
  // } = useGetCompressionSignaturesForOwner(address, !!data);

  if (isError)
    return (
      <Card className="col-span-12">
        <CardContent className="pt-6">
          <div>Failed to load</div>
        </CardContent>
      </Card>
    );
  if (isLoading || isPending)
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

  // Check if there are any compression signatures
  const signatures: Signature[] | undefined = data?.map(
    (transaction): Signature => ({
      slot: transaction.slot,
      signature: transaction.signature,
      status: transaction.err === null ? true : false,
      blockTime: transaction.blockTime,
    }),
  );

  return (
    <Card className="col-span-12">
      <CardContent className="grid pt-6 gap-4">
        {signatures?.map((transaction) => (
          <TransactionCard
            key={transaction.signature}
            transaction={transaction}
          />
        ))}
      </CardContent>
    </Card>
  );
}
