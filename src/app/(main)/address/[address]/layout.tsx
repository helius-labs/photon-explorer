"use client";

import { useCluster } from "@/providers/cluster-provider";
import { AccountType, getAccountType } from "@/utils/account";
import { isSolanaAccountAddress } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

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

  const tabs: Tab[] = [];

  let accountType: AccountType | undefined;

  if (accountInfo.data?.value) {
    accountType = getAccountType(accountInfo.data.value);

    if (accountType === AccountType.Wallet) {
      tabs.push({
        name: "Tokens",
        href: `/address/${address}/tokens`,
      });

      tabs.push({
        name: "NFTs",
        href: `/address/${address}/nfts`,
      });
    }

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
    tabs.push({
      name: "History",
      href: `/address/${address}/history-compressed`,
    });
  }

  useEffect(() => {
    if (pathname === `/address/${address}`) {
      // Change the url state to history if the account is a wallet
      if (accountType === AccountType.Wallet) {
        router.replace(`${pathname}/tokens?cluster=${cluster}`);
      }

      if (accountType === AccountType.Token) {
        router.replace(`${pathname}/history?cluster=${cluster}`);
      }
    }
  }, [accountType, address, cluster, pathname, router]);

  useEffect(() => {
    if (pathname === `/address/${address}`) {
      if (compressedAccount.data) {
        if (pathname === `/address/${address}`) {
          // Change the url state to history-compressed
          router.replace(`${pathname}/history-compressed?cluster=${cluster}`);
        }
      }
    }
  }, [address, cluster, compressedAccount.data, pathname, router]);

  // Check if the address is valid
  if (!isSolanaAccountAddress(address)) {
    return <ErrorCard text="Invalid address" />;
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

  return (
    <>
      {accountInfo.data?.value ? (
        <>
          <AccountHeader
            address={new PublicKey(address)}
            accountInfo={accountInfo}
            compressedAccount={compressedAccount}
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
