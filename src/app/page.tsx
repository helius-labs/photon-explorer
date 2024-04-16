import type { Metadata } from "next";
import RecentTransactions from "@/components/recent-transactions";

export const metadata: Metadata = {
  title: "Home | Photon Block Explorer",
  description: "",
};

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          The Photon Block Explorer
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentTransactions />
      </div>
    </>
  );
}
