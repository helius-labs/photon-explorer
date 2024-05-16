import type { Metadata } from "next";

import AccountDetails from "@/components/account-details";

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

      <div className="grid gap-3">
        <AccountDetails address={params.address} />
      </div>
    </>
  );
}
