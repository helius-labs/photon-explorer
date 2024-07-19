"use client";

import { useCluster } from "@/providers/cluster-provider";
import { AccountType, getAccountType } from "@/utils/account";
import { isSolanaAccountAddress } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import {
  useGetCompressedAccount,
  useGetCompressionSignaturesForAccount,
} from "@/hooks/compression";
import { useGetAccountInfo, useGetSignaturesForAddress } from "@/hooks/web3";

import AccountHeader from "@/components/account/account-header";
import { ErrorCard } from "@/components/common/error-card";
import Loading from "@/components/common/loading";
import { CompressionHeader } from "@/components/compression/compression-header";
import { Tab, TabNav } from "@/components/tab-nav";

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

  // Fetch 1 signature to check if the address has been used
  const signatures = useGetSignaturesForAddress(address, 1);

  // Fetch account info can be null if the address is not used or the account has been closed
  const accountInfo = useGetAccountInfo(address);

  // Fetch 1 compression signature to check if the address has been used
  const compressedSignatures = useGetCompressionSignaturesForAccount(address);

  // Fetch account info can be null if the address is not used or the account has been closed
  const compressedAccount = useGetCompressedAccount(address);

  const accountType = useMemo(() => {
    if (
      accountInfo.data &&
      accountInfo.data.value !== undefined &&
      signatures.data !== undefined
    ) {
      return getAccountType(accountInfo.data.value, signatures.data);
    }
    return AccountType.Unknown;
  }, [accountInfo.data, signatures.data]);

  // TODO: Create better logic for the tabs based on the account type
  const tabs: Tab[] = useMemo(() => {
    const newTabs: Tab[] = [];

    if (
      accountType === AccountType.Wallet ||
      accountType === AccountType.Closed
    ) {
      newTabs.push({
        name: "Tokens",
        href: `/address/${address}/tokens`,
      });

      newTabs.push({
        name: "NFTs",
        href: `/address/${address}/nfts`,
      });

      newTabs.push({
        name: "Domains",
        href: `/address/${address}/domains`,
      });
    }

    if (compressedAccount.data) {
      newTabs.push({
        name: "History",
        href: `/address/${address}/history-compressed`,
      });
    } else {
      newTabs.push({
        name: "History",
        href: `/address/${address}/history`,
      });
    }

    // Add the "Compressed Accounts" tab if the pathname includes "compressed-accounts"
    if (pathname.includes("compressed-accounts")) {
      newTabs.push({
        name: "Compressed Accounts",
        href: `/address/${address}/compressed-accounts`,
      });
    }

    // Ensure Metadata tab is added for tokens, NFTs, and programs
    if (
      accountType === AccountType.Token ||
      accountType === AccountType.Program ||
      accountType === AccountType.MetaplexNFT ||
      accountType === AccountType.NFToken
    ) {
      newTabs.push({
        name: "Metadata",
        href: `/address/${address}/metadata`,
      });
    }

    return newTabs;
  }, [accountType, compressedAccount.data, address, pathname]);

  // Route to the correct tab based on the account type
  useEffect(() => {
    if (pathname === `/address/${address}`) {
      // Change the URL state to the appropriate tab based on the account type
      if (
        accountType === AccountType.Wallet ||
        accountType === AccountType.Closed
      ) {
        router.replace(`${pathname}/tokens?cluster=${cluster}`);
      } else if (
        accountType === AccountType.Token ||
        accountType === AccountType.Program ||
        accountType === AccountType.MetaplexNFT ||
        accountType === AccountType.NFToken
      ) {
        router.replace(`${pathname}/history?cluster=${cluster}`);
      }
    }
  }, [accountType, address, cluster, pathname, router]);

  // Route to the correct tab based on the compressed account data
  useEffect(() => {
    if (pathname === `/address/${address}`) {
      if (compressedAccount.data !== undefined) {
        router.replace(`${pathname}/history-compressed?cluster=${cluster}`);
      }
    }
  }, [
    compressedAccount.data,
    compressedSignatures.data,
    address,
    cluster,
    pathname,
    router,
  ]);

  // Check if the address is valid
  if (!isSolanaAccountAddress(address)) {
    return <ErrorCard text="Invalid address" />;
  }

  if (
    signatures.isError ||
    accountInfo.isError ||
    compressedAccount.isError ||
    compressedSignatures.isError
  ) {
    return (
      <ErrorCard
        text={`Error fetching data please try again: ${
          signatures.error?.message ||
          accountInfo.error?.message ||
          compressedAccount.error?.message ||
          compressedSignatures.error?.message
        }`}
      />
    );
  }

  if (
    signatures.isLoading ||
    accountInfo.isLoading ||
    compressedAccount.isLoading ||
    compressedSignatures.isLoading
  ) {
    return (
      <div className="mt-20 flex justify-center">
        <Loading className="h-32 w-32" />
      </div>
    );
  }

  return (
    <>
      {signatures.data &&
      signatures.data.length > 0 &&
      accountInfo.data !== undefined ? (
        <>
          <AccountHeader
            address={new PublicKey(address)}
            accountInfo={accountInfo.data.value}
            signatures={signatures.data}
            accountType={accountType}
          />
          <TabNav tabs={tabs} />
          {children}
        </>
      ) : compressedAccount.data !== undefined ? (
        <>
          <CompressionHeader
            address={new PublicKey(address)}
            compressedAccount={compressedAccount.data}
          />
          <TabNav tabs={tabs} />
          {children}
        </>
      ) : (
        <ErrorCard text="Address not found on chain" />
      )}
    </>
  );
}
