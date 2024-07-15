"use client";

import { useCluster } from "@/providers/cluster-provider";
import { AccountType, getAccountType, createEmptyAccountInfo } from "@/utils/account";
import { isSolanaAccountAddress } from "@/utils/common";
import { AccountInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useGetCompressedAccount } from "@/hooks/compression";
import { useGetAccountInfo } from "@/hooks/web3";

import { AccountHeader } from "@/components/account/account-header";
import { ErrorCard } from "@/components/common/error-card";
import { CompressionHeader } from "@/components/compression/compression-header";
import { Tab, TabNav } from "@/components/tab-nav";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddressLayout({
  children,
  params: { address },
}: {
  children: React.ReactNode;
  params: { address: string };
}) {
  const router = useRouter();
  const { cluster } = useCluster();
  const pathname = usePathname();

  // Fetch account data
  const accountInfo = useGetAccountInfo(address);

  // Fetch compressed account data
  const compressedAccount = useGetCompressedAccount(address);

  const accountType = useMemo(() => {
    if (accountInfo.data?.value) {
      return getAccountType(accountInfo.data.value);
    }
    return AccountType.Unknown;
  }, [accountInfo.data]);

  const tabs: Tab[] = useMemo(() => {
    const newTabs: Tab[] = [];

    if (accountType === AccountType.Wallet || accountType === AccountType.Unknown) {
      newTabs.push({
        name: "Tokens",
        href: `/address/${address}/tokens`,
      });

      newTabs.push({
        name: "NFTs",
        href: `/address/${address}/nfts`,
      });
    }

    if (accountType !== AccountType.Unknown) {
      newTabs.push({
        name: "History",
        href: `/address/${address}/history`,
      });
    }

    if (compressedAccount.data) {
      newTabs.push({
        name: "History",
        href: `/address/${address}/history-compressed`,
      });
    }

    // Add the "Compressed Accounts" tab if the pathname includes "compressed-accounts"
    if (pathname.includes("compressed-accounts")) {
      newTabs.push({
        name: "Compressed Accounts",
        href: `/address/${address}/compressed-accounts`,
      });
    }

    return newTabs;
  }, [accountType, compressedAccount.data, address, pathname]);

  useEffect(() => {
    if (pathname === `/address/${address}`) {
      // Change the URL state to the appropriate tab based on the account type
      if (accountType === AccountType.Wallet || accountType === AccountType.Unknown) {
        router.replace(`${pathname}/tokens?cluster=${cluster}`);
      } else if (accountType === AccountType.Token) {
        router.replace(`${pathname}/history?cluster=${cluster}`);
      } else if (compressedAccount.data) {
        router.replace(`${pathname}/history-compressed?cluster=${cluster}`);
      }
    }
  }, [accountType, compressedAccount.data, address, cluster, pathname, router]);

  // Check if the address is valid
  if (!isSolanaAccountAddress(address)) {
    console.error("Invalid address:", address);
    return <ErrorCard text="Invalid address" />;
  }

  if (accountInfo.isError) {
    console.error("Error fetching account info:", accountInfo.error);
    return (
      <ErrorCard text="Invalid connection, check your config and try again." />
    );
  }

  if (accountInfo.isLoading) {
    return (
      <div>
        <div className="mb-8 flex flex-row items-center gap-4">
          <div>
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
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

  // Add logging to understand the data structure
  console.log("Account Info Data:", accountInfo.data);
  console.log("Compressed Account Data:", compressedAccount.data);

  const accountData: AccountInfo<Buffer | ParsedAccountData> = accountInfo.data?.value ?? createEmptyAccountInfo(new PublicKey(address));

  return (
    <>
      {(accountInfo.data || compressedAccount.data) ? (
        <>
          <AccountHeader
            address={new PublicKey(address)}
            accountInfo={accountData}
            compressedAccount={compressedAccount.data ?? null}
            />
            <TabNav tabs={tabs} />
            {children}
          </>
        ) : compressedAccount.data ? (
          <>
            <CompressionHeader
              address={new PublicKey(address)}
              compressedAccount={compressedAccount.data}
            />
            <TabNav tabs={tabs} />
            {children}
        </>
      ) : (
        <ErrorCard text="Address not found" />
      )}
    </>
  );
}
