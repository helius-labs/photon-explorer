"use client";

import { useCluster } from "@/providers/cluster-provider";
import { AccountType, getAccountType } from "@/utils/account";
import { isSolanaAccountAddress } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useGetCompressedAccount, useGetCompressionSignaturesForAccount } from "@/hooks/compression";
import { useGetAccountInfo, useGetSignaturesForAddress } from "@/hooks/web3";

import AccountHeader from "@/components/account/account-header";
import { ErrorCard } from "@/components/common/error-card";
import LottieLoader from "@/components/common/lottie-loading";
import loadingBarAnimation from '@/../public/assets/animations/loadingBar.json';
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
  const searchParams = useSearchParams();

  const [tabs, setTabs] = useState<Tab[]>([]);

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
      return getAccountType(
        accountInfo.data.value,
        signatures.data,
      );
    }
    return AccountType.Unknown;
  }, [accountInfo.data, signatures.data]);

  const handleTabsUpdate = (updatedTabs: Tab[]) => {
    setTabs((prevTabs) => {
      const isDifferent = JSON.stringify(prevTabs) !== JSON.stringify(updatedTabs);
      if (isDifferent) {
        return updatedTabs;
      }
      return prevTabs;
    });
  };

  // Default to "Transactions" tab if only the address is provided (no specific tab in the URL)
  useEffect(() => {
    const currentPath = pathname;
    const hasTabInUrl = currentPath !== `/address/${address}`;
    
    if (!hasTabInUrl && accountType === AccountType.Token) {
      router.replace(`/address/${address}/history?cluster=${cluster}`);
    }
  }, [accountType, address, cluster, pathname, router]);

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
        <LottieLoader animationData={loadingBarAnimation} className="h-32 w-32 opacity-80" />
      </div>
    );
  }

  // Check for minimal data rendering
  if (accountInfo.data || signatures.data || compressedAccount.data) {
    return (
      <>
        <AccountHeader
          address={new PublicKey(address)}
          accountInfo={accountInfo.data?.value || null}
          signatures={signatures.data || []}
          accountType={accountType}
          onTabsUpdate={handleTabsUpdate}
        />
        {compressedAccount.data && (
          <CompressionHeader
            address={new PublicKey(address)}
            compressedAccount={compressedAccount.data}
          />
        )}
        <TabNav tabs={tabs} />
        {children}
      </>
    );
  }

  return <ErrorCard text="Address not found on chain" />;
}
