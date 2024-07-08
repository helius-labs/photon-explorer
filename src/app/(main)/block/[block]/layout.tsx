"use client";

import { isSolanaAccountAddress } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";
import { PropsWithChildren } from "react";

import { useGetCompressedAccount } from "@/hooks/compression";
import { useGetAccountInfo, useGetBlock } from "@/hooks/web3";

import { AccountHeader } from "@/components/account/account-header";
import { AccountTabs } from "@/components/account/account-tabs";
import BlockHeader from "@/components/block/block-header";
import { BlockTabs } from "@/components/block/block-tabs";

type Props = PropsWithChildren<{ params: { block: string } }>;

export default function AddressLayout({ children, params: { block } }: Props) {
  const { data, isLoading, isError } = useGetBlock(Number(block));

  if (isNaN(Number(block))) {
    return (
      <div className="flex items-center justify-center p-6 text-lg text-muted-foreground">
        Invalid block
      </div>
    );
  }

  return (
    <>
      <BlockHeader block={Number(block)} data={data} />
      <BlockTabs block={Number(block)} />
      <div>{children}</div>
    </>
  );
}
