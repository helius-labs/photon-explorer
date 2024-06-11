"use client";

import { isAddress } from "@solana/web3.js";
import { PropsWithChildren } from "react";

import { useGetAccountInfo } from "@/hooks/web3";

import { AccountTabs } from "@/components/account/AccountTabs";
import { WalletAccountHeader } from "@/components/account/WalletAccountHeader";

type Props = PropsWithChildren<{ params: { address: string } }>;

export default function AddressLayout({
  children,
  params: { address },
}: Props) {
  const accountInfo = useGetAccountInfo(address);

  if (!isAddress(address)) {
    return <div>Invalid address</div>;
  }

  return (
    <>
      <WalletAccountHeader address={address} accountInfo={accountInfo} />
      <AccountTabs address={address} />
      <div>{children}</div>
    </>
  );
}
