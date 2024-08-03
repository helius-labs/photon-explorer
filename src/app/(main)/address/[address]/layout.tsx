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
import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
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

  // Fetch 1 signature to check if the address has been used
  const signatures = useGetSignaturesForAddress(address, 1);

  // Fetch account info can be null if the address is not used or the account has been closed
  const accountInfo = useGetAccountInfo(address);

  // Fetch 1 compression signature to check if the address has been used
  const compressedSignatures = useGetCompressionSignaturesForAccount(address);

  // Fetch account info can be null if the address is not used or the account has been closed
  const compressedAccount = useGetCompressedAccount(address);

  // Fetch NFT data to check if it's a compressed NFT
  const {
    data: nftData,
    isLoading: nftLoading,
    isError: nftError,
  } = useGetNFTsByMint(address);

  const accountType = useMemo(() => {
    if (
      accountInfo.data &&
      accountInfo.data.value !== undefined &&
      signatures.data !== undefined
    ) {
      return getAccountType(
        accountInfo.data.value,
        signatures.data,
        nftData || undefined,
      );
    }
    if (nftData?.compression?.compressed) {
      return AccountType.CompressedNFT;
    }
    return AccountType.Unknown;
  }, [accountInfo.data, signatures.data, nftData]);

  // Create better logic for the tabs based on the account type
  const tabs: Tab[] = useMemo(() => {
    const newTabs: Tab[] = [];

    if (accountType === AccountType.Wallet || accountType === AccountType.Closed) {
      // Add the default tabs in the new order for wallet accounts
      newTabs.push({ name: "Tokens", href: `/address/${address}/tokens` });
      newTabs.push({ name: "Transactions", href: `/address/${address}/history` });
      newTabs.push({ name: "NFTs", href: `/address/${address}/nfts` });
      newTabs.push({ name: "Domains", href: `/address/${address}/domains` });
    } else if (
      accountType === AccountType.Token ||
      accountType === AccountType.Program ||
      accountType === AccountType.MetaplexNFT ||
      accountType === AccountType.NFToken ||
      accountType === AccountType.CompressedNFT
    ) {
      // Add tabs specific to Token, Program, NFT, or Compressed NFT accounts
      newTabs.push({ name: "Transactions", href: `/address/${address}/history` });
      newTabs.push({ name: "Metadata", href: `/address/${address}/metadata` });
    }

    // Add the "Compressed Accounts" tab if the pathname includes "compressed-accounts"
    if (pathname.includes("compressed-accounts")) {
      newTabs.push({
        name: "Compressed Accounts",
        href: `/address/${address}/compressed-accounts`,
      });
    }

    return newTabs;
  }, [accountType, address, pathname]);

  // Route to the correct tab based on the account type
  useEffect(() => {
    // Only redirect to "tokens" tab if the current path is exactly the wallet address path
    if (pathname === `/address/${address}`) {
      if (
        accountType === AccountType.Wallet ||
        accountType === AccountType.Closed
      ) {
        router.replace(`/address/${address}/tokens?cluster=${cluster}`);
      } else if (
        accountType === AccountType.Token ||
        accountType === AccountType.Program ||
        accountType === AccountType.MetaplexNFT ||
        accountType === AccountType.NFToken ||
        accountType === AccountType.CompressedNFT ||
        accountType === AccountType.Unknown // Added to handle unknown account types
      ) {
        router.replace(`/address/${address}/tokens?cluster=${cluster}`);
      }
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
    compressedSignatures.isError ||
    nftError
  ) {
    return (
      <ErrorCard
        text={`Error fetching data please try again: ${
          signatures.error?.message ||
          accountInfo.error?.message ||
          compressedAccount.error?.message ||
          compressedSignatures.error?.message ||
          nftError
        }`}
      />
    );
  }

  if (
    signatures.isLoading ||
    accountInfo.isLoading ||
    compressedAccount.isLoading ||
    compressedSignatures.isLoading ||
    nftLoading
  ) {
    return (
      <div className="mt-20 flex justify-center">
        <LottieLoader animationData={loadingBarAnimation} className="h-32 w-32 opacity-80" />
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
      ) : nftData?.compression?.compressed ? (
        <>
          <AccountHeader
            address={new PublicKey(address)}
            accountInfo={null}
            signatures={signatures.data || []}
            accountType={AccountType.CompressedNFT}
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
        <ErrorCard text="Address not found on chain" />
      )}
    </>
  );
}
