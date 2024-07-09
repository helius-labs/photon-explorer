"use client";

import { isSolanaAccountAddress } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";
import { PropsWithChildren } from "react";

import { useGetCompressedAccount } from "@/hooks/compression";
import { useGetAccountInfo } from "@/hooks/web3";

import { AccountHeader } from "@/components/account/account-header";
import { AccountTabs } from "@/components/account/account-tabs";
import { ErrorCard } from "@/components/common/error-card";

type Props = PropsWithChildren<{ params: { address: string } }>;

export default function AddressLayout({
  children,
  params: { address },
}: Props) {
  const accountInfo = useGetAccountInfo(address);

  // Address could be compressed account hash or address
  const compressedAccount = useGetCompressedAccount(address);

  if (!isSolanaAccountAddress(address)) {
    return <ErrorCard text="Invalid address" />;
  }

  if (accountInfo.isError) {
    return (
      <ErrorCard text="Invalid connection, check your config and try again." />
    );
  }

  return (
    <>
      <AccountHeader
        address={new PublicKey(address)}
        accountInfo={accountInfo}
        compressedAccount={compressedAccount}
      />
      <AccountTabs address={address} />
      <div>{children}</div>
    </>
  );
}
