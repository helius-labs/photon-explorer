import { BigNumber } from "bignumber.js";
import React from "react";

import { SolBalance } from "@/components/common/sol-balance";

export function BalanceDelta({
  delta,
  isSol = false,
  maximumFractionDigits = undefined,
}: {
  delta: BigNumber;
  isSol?: boolean;
  maximumFractionDigits?: number;
}) {
  let sols;

  if (isSol) {
    sols = (
      <SolBalance
        lamports={Math.abs(delta.toNumber())}
        maximumFractionDigits={maximumFractionDigits}
      />
    );
  }

  if (delta.gt(0)) {
    return (
      <span className="text-[#06D6A0] cursor-default">+{isSol ? sols : delta.toString()}</span>
    );
  } else if (delta.lt(0)) {
    return (
      <span className="text-[#EF476F] cursor-default">
        {isSol ? <>-{sols}</> : delta.toString()}
      </span>
    );
  }

  return <span>0 SOL</span>;
}
