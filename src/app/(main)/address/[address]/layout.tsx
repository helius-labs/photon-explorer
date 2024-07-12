"use client";

import { useCluster } from "@/providers/cluster-provider";
import { AccountType, getAccountType } from "@/utils/account";
import { isSolanaAccountAddress } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

import { useGetCompressedAccount } from "@/hooks/compression";
import { useGetAccountInfo } from "@/hooks/web3";

import { AccountHeader } from "@/components/account/account-header";
import { ErrorCard } from "@/components/common/error-card";
import { CompressionHeader } from "@/components/compression/compression-header";
import { Tab, TabNav } from "@/components/tab-nav";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddressLayout({
  children,
  compression,
  params: { address },
}: {
  children: React.ReactNode;
  compression: React.ReactNode;
  params: { address: string };
}) {
  const { cluster } = useCluster();
  const pathname = usePathname();

  // Fetch account data
  const accountInfo = useGetAccountInfo(address);

  // Fetch compressed account data
  const compressedAccount = useGetCompressedAccount(address);

  // Check if the address is valid
  if (!isSolanaAccountAddress(address)) {
    return <ErrorCard text="Invalid address" />;
  }

  const tabs: Tab[] = [];

  if (accountInfo.data && accountInfo.data.value) {
    const accountType = getAccountType(accountInfo.data.value);

    if (pathname === `/address/${address}`) {
      // Change the url state to history if the account is a wallet
      if (accountType === AccountType.Wallet) {
        window.history.replaceState(
          null,
          "",
          `${pathname}/tokens?cluster=${cluster}`,
        );
      }
    }

    tabs.push({
      name: "Tokens",
      href: `/address/${address}/tokens`,
    });

    tabs.push({
      name: "NFTs",
      href: `/address/${address}/nfts`,
    });

    tabs.push({
      name: "History",
      href: `/address/${address}/history`,
    });

    // Add the "Compressed Accounts" tab if the pathname includes "compressed-accounts"
    if (pathname.includes("compressed-accounts")) {
      tabs.push({
        name: "Compressed Accounts",
        href: `/address/${address}/compressed-accounts`,
      });
    }
  }

  if (compressedAccount.data) {
    if (pathname === `/address/${address}`) {
      // Change the url state to history-compressed
      window.history.replaceState(
        null,
        "",
        `${pathname}/history-compressed?cluster=${cluster}`,
      );
    }

    tabs.push({
      name: "History",
      href: `/address/${address}/history-compressed`,
    });
  }

  if (accountInfo.isError) {
    return (
      <ErrorCard text="Invalid connection, check your config and try again." />
    );
  }

  if (accountInfo.isLoading) {
    return (
      <div>
        <div className="mb-8 flex flex-row items-center gap-4">
          <div>
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-5 w-[100px]" />
          </div>
        </div>
        <div className="mb-8 flex gap-4">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-20" />
        </div>
        <div className="h-96 w-full">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      {accountInfo.data && accountInfo.data.value && (
        <>
          <AccountHeader
            address={new PublicKey(address)}
            accountInfo={accountInfo.data.value}
          />
          <TabNav tabs={tabs} />
          {children}
        </>
      )}
      {compressedAccount.data && (
        <>
          <CompressionHeader
            address={new PublicKey(address)}
            compressedAccount={compressedAccount.data}
          />
          <TabNav tabs={tabs} />
          {compression}
        </>
      )}
    </>
  );
}
