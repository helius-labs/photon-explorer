import { PropsWithChildren } from "react";

import BlockHeader from "@/components/block/block-header";
import { BlockTabs } from "@/components/block/block-tabs";
import { ErrorCard } from "@/components/common/error-card";

type Props = PropsWithChildren<{ params: { slot: string } }>;

export default function AddressLayout({ children, params: { slot } }: Props) {
  if (isNaN(Number(slot))) {
    return <ErrorCard text="Invalid block" />;
  }

  return (
    <>
      <BlockHeader slot={Number(slot)} />
      <BlockTabs slot={slot} />
      <div>{children}</div>
    </>
  );
}
