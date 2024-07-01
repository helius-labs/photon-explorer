"use client";

import { PublicKey } from "@solana/web3.js";
import { PropsWithChildren } from "react";
import { isAddress } from "web3js-experimental";

import { useGetCompressedAccount } from "@/hooks/compression";
import { useGetAccountInfo } from "@/hooks/web3";

import { AccountHeader } from "@/components/account/account-header";
import { AccountTabs } from "@/components/account/account-tabs";

type Props = PropsWithChildren<{ params: { address: string } }>;

export default function AddressLayout({
  children,
  params: { address },
}: Props) {
  const accountInfo = useGetAccountInfo(address);

  // Address could be compressed account hash or address
  const compressedAccount = useGetCompressedAccount(address);

  if (!isAddress(address)) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground text-lg">
        Invalid address
      </div>
    );
  }

  if (accountInfo.isError) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground text-lg">
        Invalid connection, check your config and try again.
      </div>
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
