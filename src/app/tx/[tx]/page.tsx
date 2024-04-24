import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import TransactionDetails from "@/components/transaction-details";

export const metadata: Metadata = {
  title: "Transaction Details | Photon Block Explorer",
  description: "",
};

export default function Page({ params }: { params: { tx: string } }) {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Transaction Details
        </h1>
      </div>

      <div className="grid gap-3">
        <Card className="w-full ">
          <CardContent className="pt-6">
            <TransactionDetails tx={params.tx} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
